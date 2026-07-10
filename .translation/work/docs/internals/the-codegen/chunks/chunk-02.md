## Legacy AST expression codegen

**Files:** `src/codegen/expr.rs`, `src/codegen/expr/`

The frozen `--ast-backend` path still uses `emit_expr()` to take an expression node and emit code that leaves the result in the standard registers. The default backend reaches the same ABI/runtime helpers through EIR lowering in `src/ir_lower/` and instruction lowering in `src/codegen_ir/`. The top-level legacy `expr.rs` file mainly dispatches into focused helpers under `expr/` such as `scalars.rs`, `variables.rs`, `binops/`, `arrays.rs`, `compare/`, `calls/`, and `objects/`.

| Type | Result location |
|---|---|
| `Int` / `Bool` / `Void` / `Resource` | `x0` |
| `Float` | `d0` |
| `Str` | `x1` (pointer), `x2` (length) |
| `Array` / `AssocArray` / `Iterable` | `x0` (heap pointer) |
| `Mixed` | `x0` (pointer to boxed mixed cell) |
| `Object` | `x0` (heap pointer) |
| `Callable` / `Pointer` | `x0` |
| `Buffer` / `Packed` | `x0` (heap pointer) |
| `Union` | `x0` (same as Mixed — boxed runtime-tagged payload) |

### Expression AST dispatch coverage

The legacy expression dispatcher is intentionally thin. It routes each `ExprKind`
variant into one of the focused lowering paths below, while the EIR path mirrors the same PHP-visible coverage through `src/ir_lower/expr/`:

| Variants | Lowering path |
|---|---|
| `StringLiteral`, `IntLiteral`, `FloatLiteral`, `BoolLiteral`, `Null`, `Negate`, `Not`, `BitNot`, `Cast`, `Print`, `ErrorSuppress` | Scalar, coercion, stdout, and diagnostics helpers |
| `Variable`, `This`, `PreIncrement`, `PostIncrement`, `PreDecrement`, `PostDecrement`, `Assignment` | Variable load/store and assignment-expression helpers |
| `BinaryOp`, `InstanceOf`, `NullCoalesce`, `Pipe`, `Ternary`, `ShortTernary`, `Throw` | Operator, comparison, call-pipe, branch, and exception-aware expression helpers |
| `ArrayLiteral`, `ArrayLiteralAssoc`, `ArrayAccess`, `Spread`, `Match` | Indexed-array, associative-array, unpacking, string-indexing, and match-expression helpers |
| `FunctionCall`, `NamedArg`, `ClosureCall`, `ExprCall`, `Closure`, `FirstClassCallable` | Shared call-argument planner, closure wrappers, and callable dispatch helpers |
| `ConstRef`, `ClassConstant`, `ScopedConstantAccess`, `MagicConstant` | Compile-time constant and class-constant loading. `MagicConstant` should already be lowered by the frontend before codegen. |
| `NewObject`, `NewDynamic`, `NewScopedObject`, `NewDynamicObject`, `PropertyAccess`, `DynamicPropertyAccess`, `NullsafePropertyAccess`, `NullsafeDynamicPropertyAccess`, `StaticPropertyAccess`, `MethodCall`, `NullsafeMethodCall`, `StaticMethodCall` | Object allocation (including `new $var()` via `NewDynamic` and the internal runtime-class-string factory `NewDynamicObject`), property/member access, nullsafe chain lowering, vtable dispatch, and late-static-binding helpers |
| `PtrCast`, `BufferNew`, `Yield`, `YieldFrom` | Pointer/buffer extensions and generator state-machine lowering |

### Intrinsic Calls

Most method calls use the normal class metadata path: receiver evaluation, argument materialization, vtable or direct-method target selection, then a call to the emitted PHP method body. A small set of runtime-managed core objects cannot use the synthetic PHP stubs as their real implementation. For those, `src/intrinsics.rs` records an `IntrinsicCall` entry keyed by PHP class and method name, and `src/codegen/expr/objects/dispatch/intrinsic.rs` emits the direct runtime-helper call after the normal receiver and argument setup has already run.

Current intrinsic call sites cover `Fiber` instance/static APIs and the runtime-backed `Generator` method surface. User classes with the same method names are not affected because the lookup includes the resolved class name.

### Literals

```php
42        →  mov x0, #42
3.14      →  adrp x9, _float_0@PAGE  /  add x9, ...  /  ldr d0, [x9]
"hello"   →  adrp x1, _str_0@PAGE  /  add x1, ...  /  mov x2, #5
true      →  mov x0, #1
null      →  movz x0, #0xFFFE  /  movk x0, ...  (load null sentinel)
```

Large integers (> 65535 or negative) use `movz` + `movk` sequences. See [ARM64 Instruction Reference](arm64-instructions.md#loading-large-constants).

### The push/pop pattern for binary operations

Binary operations like `$a + $b` need both operands in registers simultaneously, but `emit_expr` uses the same registers for every expression. The solution: **push the left result onto the stack, evaluate the right, then pop the left back**.

```php
$a + $b
```

```asm
; Step 1: evaluate left ($a)
ldur x0, [x29, #-8]              ; x0 = $a

; Step 2: push left onto stack
str x0, [sp, #-16]!              ; save x0 to stack, decrement sp

; Step 3: evaluate right ($b)
ldur x0, [x29, #-16]             ; x0 = $b  (overwrites left!)

; Step 4: pop left back into a different register
ldr x1, [sp], #16                ; restore left into x1, increment sp

; Step 5: operate
add x0, x1, x0                   ; x0 = left + right
```

For strings (which use two registers), the push saves both `x1` and `x2`, and the pop restores them to `x3` and `x4`.

For floats, the push/pop uses `d0`/`d1`:

```asm
str d0, [sp, #-16]!              ; push left float
; ... evaluate right → d0 ...
ldr d1, [sp], #16                ; pop left float into d1
fadd d0, d1, d0                  ; d0 = left + right
```

### Comparison operators

Comparisons use `cmp` (integer) or `fcmp` (float) followed by `cset`:

```php
$x > 5
```

```asm
; ... push $x, evaluate 5 ...
cmp x1, x0                       ; compare left with right
cset x0, gt                      ; x0 = 1 if greater, 0 otherwise
```

The result is always `x0` with value 0 or 1 (`PhpType::Bool`).

### Short-circuit logical operators

`&&`, `||`, `and`, and `or` use **short-circuit evaluation** — the right side isn't evaluated if the left determines the result. `xor` is also a logical operator, but it evaluates both operands because exclusive OR needs both truthiness values.

```php
$a && $b
```

```asm
; evaluate $a
cmp x0, #0
b.eq _sc_end_1          ; if $a is falsy, skip $b entirely (result = 0)
; evaluate $b
cmp x0, #0
cset x0, ne             ; result = whether $b is truthy
_sc_end_1:
```

### String concatenation

The `.` operator calls the runtime's `__rt_concat`:

```php
"hello" . " world"
```

```asm
; push left string (x1, x2)
; evaluate right string → x1, x2
; pop left → x3, x4
; call concat
mov x3, ...              ; left ptr
mov x4, ...              ; left len
bl __rt_concat           ; result → x1 (ptr), x2 (len)
```

See [The Runtime](the-runtime.md) for how `__rt_concat` works.

### Bitwise operations

The bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`) operate on integers and emit single ARM64 instructions:

```php
$a & $b    →  and x0, x1, x0     // bitwise AND
$a | $b    →  orr x0, x1, x0     // bitwise OR
$a ^ $b    →  eor x0, x1, x0     // bitwise XOR
$a << $b   →  lsl x0, x1, x0     // logical shift left
$a >> $b   →  asr x0, x1, x0     // arithmetic shift right (preserves sign)
~$a        →  mvn x0, x0         // bitwise complement (one's complement)
```

Like other binary operations, bitwise ops use the push/pop pattern — evaluate left, push, evaluate right, pop left, apply operation.

### Spaceship operator

The spaceship operator (`<=>`) returns -1, 0, or 1 depending on the comparison result. It uses conditional select instructions:

```php
$a <=> $b
```

```asm
; ... push $a, evaluate $b ...
cmp x1, x0                      ; compare left with right
cset x0, gt                     ; x0 = 1 if left > right, else 0
csinv x0, x0, xzr, ge           ; if left < right: x0 = ~0 = -1 (all ones)
```

`csinv` (conditional select invert) inverts `xzr` (the zero register) to produce -1 when the condition is not met.

For floats, `fcmp` replaces `cmp`, but the same `cset`/`csinv` pattern applies.

### Array union

When both operands of `+` are arrays, codegen routes the expression to PHP array-union lowering instead of numeric addition. Indexed arrays call `__rt_array_union`, which clones the left operand and appends only the right-side numeric suffix whose keys are missing from the left. Associative arrays call `__rt_hash_union`, which clones the left hash, walks the right hash in insertion order, and inserts only keys that are absent from the clone. Mixed indexed/associative operands return a hash result: `__rt_array_hash_union` maps left indexed positions into integer hash keys before merging the right hash, while `__rt_hash_array_union` clones the left hash and probes right indexed positions as integer keys.

### Null coalescing operator

The `??` operator returns the left operand if it is non-null, otherwise the right:

```php
$x ?? "default"
```

```asm
; evaluate $x
; compare with null sentinel (0x7FFFFFFFFFFFFFFE)
b.ne _nc_done_1          ; if not null, keep left value
; evaluate "default"      ; otherwise, use right side
_nc_done_1:
```

The null check compares the value against the [null sentinel](memory-model.md). The operator is right-associative (`$a ?? $b ?? $c` = `$a ?? ($b ?? $c)`).

Null coalescing assignment is parsed as `$x = $x ?? expr`, but assignment lowering recognizes that exact shape and emits a conditional store:

```php
$x ??= "default";
```

The generated code loads `$x`, branches past the assignment when it is non-null, and evaluates/stores the right-hand side only on the null path. This preserves PHP's `??=` short-circuit behavior and avoids rewriting an already-owned heap value back into the same local slot.

### Pipe operator

PHP 8.5 `value |> callable` lowers through `src/codegen/expr/calls/pipe.rs`.
`emit_expr()` first stores the left-hand value into a hidden local slot so the
left side is observably evaluated before the callable target. It then builds a
synthetic one-argument call using that hidden local as the single positional
argument.

The pipe lowering delegates to the existing call paths whenever possible:
first-class function targets become `FunctionCall`, first-class static method
targets become `StaticMethodCall`, first-class instance method targets become
`MethodCall`, local callable variables become `ClosureCall`, and other callable
expressions become `ExprCall`. Argument planning, ABI materialization,
ownership, and diagnostics therefore stay aligned with ordinary calls.

### Error-control operator

The `@` operator lowers to a scoped runtime diagnostic-suppression pair:

1. Call `__rt_diag_push_suppression`
2. Evaluate the operand normally
3. Preserve the operand result in the appropriate ABI result shape
4. Call `__rt_diag_pop_suppression`
5. Restore the operand result

The exception handler frame also snapshots the current suppression depth before `setjmp()` and restores it after a `longjmp()` into catch dispatch. That prevents a thrown expression inside `@` from leaking warning suppression into later code.

### Nullsafe operator

The `?->` operator lowers nullable receivers through the boxed mixed path used by nullable and union storage. Codegen flattens postfix chains that contain a nullsafe segment, evaluates the base once, and branches to a shared boxed-`null` result when a nullsafe receiver is null. That branch skips the rest of the chain, including later ordinary `->` segments, array indexes, method arguments, and callable arguments. If an ordinary segment later receives a real null value from the non-short-circuited path, it still follows PHP's warning or fatal behavior.

### Type coercions

When types need to match (e.g., int + float), the codegen inserts conversion instructions:

```asm
scvtf d0, x0             ; convert signed integer (x0) → double (d0)
fcvtzs x0, d0            ; convert double (d0) → signed integer (x0)
```

The `.` (concat) operator also coerces non-strings:

- `Int` → calls `__rt_itoa` to get a string
- `Float` → calls `__rt_ftoa`
- `Bool true` → string "1"
- `Bool false` / `Null` → empty string (length 0)