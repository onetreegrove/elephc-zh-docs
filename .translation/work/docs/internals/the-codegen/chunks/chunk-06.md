### If / Elseif / Else

```php
if ($cond1) { body1 } elseif ($cond2) { body2 } else { body3 }
```

```asm
; evaluate $cond1
cmp x0, #0
b.eq _elseif_1           ; skip to next branch if falsy

; body1
b _end_if_1               ; done — skip all remaining branches

_elseif_1:
; evaluate $cond2
cmp x0, #0
b.eq _else_1

; body2
b _end_if_1

_else_1:
; body3

_end_if_1:
```

### While loop

```php
while ($cond) { body }
```

```asm
_while_1:                  ; ← continue jumps here
; evaluate $cond
cmp x0, #0
b.eq _end_while_1         ; exit if falsy ← break jumps here

; body
b _while_1                 ; loop back

_end_while_1:
```

### For loop

```php
for ($i = 0; $i < 10; $i++) { body }
```

```asm
; emit init ($i = 0)

_for_1:
; evaluate condition ($i < 10)
cmp x0, #0
b.eq _end_for_1

; body

_for_cont_1:               ; ← continue jumps here
; emit update ($i++)
b _for_1

_end_for_1:                 ; ← break jumps here
```

### Foreach

```php
foreach ($arr as $v) { body }
```

For indexed arrays:

1. Save array pointer, length, and index counter on the stack (3 × 16-byte slots)
2. Loop: load element at current index, unbox through the runtime `value_type` tag when the static element type is `Mixed`, store to `$v`, and classify heap-backed loop variables as borrowed aliases of the iterated container
3. Branch back to condition check
4. Cleanup: deallocate the 48 bytes

For associative arrays, see [Associative array codegen](#associative-array-codegen): the loop stores a hash pointer plus cursor, then advances with `__rt_hash_iter_next`.

For `Iterator` objects, codegen parks the receiver in a 16-byte stack slot, dispatches `rewind()`, then drives the loop through `valid()`, `key()`, `current()`, and `next()`. Keys and values are boxed into `Mixed` because the concrete runtime payload can vary per iterator implementation. `IteratorAggregate` values dispatch `getIterator()` first, then reuse the same iterator loop path. Values typed as `iterable` branch through runtime heap-kind and interface metadata so arrays, direct `Iterator` objects, and aggregate-backed objects select the correct lowering.

Before the first `valid()` call, foreach target slots are normalized to boxed `Mixed`. That keeps empty iterators compatible with PHP: existing target variables keep a valid mixed cell, fresh loop variables remain null-like, and receiver aliases stay live until loop cleanup.

### Break / Continue

`break` emits a `b` (unconditional jump) to the selected loop/switch end label.
`continue` emits a `b` to the selected continue label (the condition check for
`while`, the update for `for`, or the switch end label for PHP-style
`continue` inside `switch`).

The `loop_stack` in the Context tracks labels for nested loops and switches.
Multi-level forms such as `break 2;` and `continue 2;` index back through that
stack. Each `LoopLabels` entry also carries an `sp_adjust` field so multi-level
exits and returns can undo any skipped switch-subject temporary stack slots
before jumping to the selected target or shared function epilogue. If the exit
crosses a `finally`, codegen records the selected target and runs the active
`finally` chain before resuming the branch.

The type checker rejects `break` / `continue` that would jump out of a
`finally` body, so codegen only has to route legal exits from protected `try` or
`catch` bodies through `finally_stack`.

### Exceptions and `finally`

Exception lowering lives in `src/codegen/stmt/control_flow/exceptions.rs`. The basic strategy is:

1. Evaluate the thrown object and publish it to `_exc_value`
2. Call `__rt_throw_current`, which unwinds activation records and `longjmp`s into the nearest handler
3. For `try`, emit a `_setjmp` resume point plus a linked handler record in `_exc_handler_top`
4. Test each catch target by class id or interface id through `__rt_exception_matches`
5. Route `return`, `break`, `continue`, and rethrow through `finally_stack` so every enclosing `finally` runs before control leaves the protected region. The checker rejects `break` / `continue` that would originate inside a `finally` and target an outer loop/switch.

This means `finally` is part of ordinary control-flow lowering, not a separate runtime pass. The runtime only unwinds frames and chooses the landing pad; the compiler-generated labels still decide whether execution resumes in a matching `catch`, in a `finally`, or in an outer handler.

### Switch

```php
switch ($x) {
    case 1: echo "one"; break;
    case 2: echo "two"; break;
    default: echo "other"; break;
}
```

1. Evaluate the subject expression once and push the result onto the stack
2. For each case: pop subject, evaluate case value, compare (`cmp` + `b.ne` for integers, `bl __rt_str_eq` for strings)
3. If match: emit case body, which may contain `break` (jump to end label) or fall through to next case
4. Default case: emit body unconditionally
5. End label after all cases

The switch uses the loop stack so that `break` inside a case body jumps to the switch end label rather than an enclosing loop.

### Match expression

Match is an expression (returns a value), not a statement. It uses strict comparison (`===`) and has no fall-through:

```php
$result = match($x) {
    1 => "one",
    2 => "two",
    default => "other",
};
```

1. Evaluate subject, push onto stack
2. For each arm: compare subject with each pattern in the arm's pattern list
3. If any pattern matches: evaluate the arm's result expression, jump to end
4. Default arm: evaluate result unconditionally
5. Result is left in standard registers (`x0`, `d0`, or `x1`/`x2`)

## Class codegen

### Object allocation (`new ClassName(...)`)

When the codegen encounters a `NewObject` expression:

1. **Calculate object size**: `8 + (num_properties × 16) + dyn_props_slot` — 8 bytes for the class ID, 16 bytes per property across the full inherited layout, plus one optional 8-byte slot for the dynamic-property hash pointer when the class carries `#[\AllowDynamicProperties]`
2. **Allocate heap memory**: call `__rt_heap_alloc` with the calculated size
3. **Zero-initialize**: clear all property slots to zero
4. **Store class ID**: write the class identifier at offset 0
5. **Apply defaults**: for properties with default values, evaluate and store them at their fixed offsets
6. **Call constructor**: if the class exposes `__construct`, pass the new object pointer as `x0` (`$this`) followed by the constructor arguments, then branch to the implementation label recorded in class metadata (which may come from an inherited constructor)

Classes declared with the PHP 8.2 `#[\AllowDynamicProperties]` attribute reserve a trailing per-object hash slot so undeclared property writes/reads can be routed through a runtime side table instead of failing at compile time.

The result is the object pointer in `x0`.

### Attribute reflection objects

`new ReflectionClass(...)`, `new ReflectionMethod(...)`, and `new ReflectionProperty(...)` are intercepted by `src/codegen/expr/objects/reflection.rs` instead of relying on ordinary user-defined constructor bodies. The type checker has already forced their class/member arguments to compile-time strings after normal call-argument planning, so codegen can look up the target `ClassInfo` directly and populate the private `__attrs` slot with a freshly built `array<ReflectionAttribute>`.

`src/codegen/reflection.rs` owns the shared materialization path. It allocates each synthetic `ReflectionAttribute`, writes the resolved `__name`, builds the `array<mixed>` `__args` payload from supported literal attribute arguments, and stores a deterministic `__factory` id. `ReflectionAttribute::newInstance()` is then generated in `src/codegen/class_methods.rs` as a branch table over those factory ids; each branch constructs the real attribute class with the captured literal args, and the fallback returns `null` when no defined attribute class can be materialized.

The `_class_attribute_*` runtime data tables still emit class-level attribute metadata from the same `ClassInfo` fields, but the supported Reflection owner constructors are compile-time materialized and do not perform runtime name lookups for classes, methods, or properties.

### Type checks (`$obj instanceof ClassName`)

`ExprKind::InstanceOf` evaluates the left-hand side exactly once, materializes the target class or interface id from emitted metadata, and returns a boolean in `x0`. Direct object values call `__rt_exception_matches`, the same metadata matcher used by exception catch lowering, so inherited classes and implemented interfaces are handled through the same parent-id and class-interface tables.

For named targets, when the left-hand side is lowered as `Mixed` or `Union`, codegen calls `__rt_mixed_instanceof` instead. That helper unwraps nested mixed boxes, returns `false` for scalar, array, null, and unknown payload tags, and only forwards object payloads into `__rt_exception_matches`. This keeps nullable and union object checks PHP-compatible without treating the boxed mixed cell itself as an object pointer.

Named targets are resolved before codegen. Named classes/interfaces become concrete metadata ids, `self` and `parent` resolve in the current lexical class context, and `static` uses the forwarded called-class id for late static binding. Dynamic targets are evaluated and validated after the left-hand side is evaluated; string targets are resolved through emitted case-insensitive class/interface name metadata, object targets load the target object's runtime class id, invalid target payloads branch to a fatal runtime diagnostic, and non-object left-hand payloads become `false` after that validation step.

### Property access (`$obj->prop`)

Property access usually uses fixed offsets computed at compile time from `ClassInfo.property_offsets`:

```asm
; $obj->prop where prop resolved to offset 24
ldur x0, [x29, #-offset]            ; load object pointer
ldur x0, [x0, #24]                  ; load property at resolved inherited offset
```

If the property does not exist but the class exposes `__get($name)`, codegen materializes the property name as a string literal, pushes it as an argument, and dispatches the instance method through the normal object-call path. The returned value then flows back through the ordinary result registers based on the inferred return type.

For property assignment (`$obj->prop = value`), the value is evaluated first, then stored at the resolved inherited offset. If the property is missing but the class exposes `__set($name, $value)`, codegen boxes the value as `Mixed`, materializes the property name, and dispatches `__set` instead of emitting a direct store.

Property-array writes use the same fixed-offset property resolution first, then delegate to the ordinary array storage paths for the nested container. `$obj->items[] = $value` lowers through `PropertyArrayPush`, and `$obj->items[$key] = $value` lowers through `PropertyArrayAssign`; both require a concrete array/assoc-array property rather than a magic `__set` fallback.

### Method call (`$obj->method(args)`)

1. Evaluate the object expression to get the pointer in `x0`
2. Push the object pointer onto the stack
3. Evaluate and push all arguments
4. Pop arguments into ABI registers, with the object pointer as the first argument (`x0`)
5. Load the object's `class_id`, fetch the class vtable pointer from `_class_vtable_ptrs`, load the method slot, and `blr` to the resolved implementation
6. Result is in the standard registers based on return type

Inside the method body, `$this` is the first parameter and lives in the function's first stack slot.

Private instance methods are the exception: they do not get vtable slots, so calls resolved to a private method of the current lexical class use a direct `_method_Class_method` branch instead of virtual dispatch.