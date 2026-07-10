### Access

```php
$m["name"]
```

1. Save hash table pointer on stack
2. Evaluate key expression → `x1`/`x2` (string)
3. Call `__rt_hash_get` → `x0` = found (0/1), `x1` = value_lo, `x2` = value_hi, `x3` = per-entry value tag
4. Move result to standard registers based on value type; if the static result is `Mixed`, box the payload into a heap cell first

### Functions on associative arrays

Builtin functions like `array_key_exists`, `in_array`, `array_keys`, `array_values` dispatch on the array type at compile time:

- `PhpType::Array` → use indexed runtime routines (e.g., bounds check, linear scan)
- `PhpType::AssocArray` → use hash table routines (e.g., `__rt_hash_get`, `__rt_hash_iter_next`)

### `foreach` over associative arrays

When `foreach` iterates a `PhpType::AssocArray`, the lowering differs from indexed arrays:

1. Save the hash pointer and an iteration cursor on the stack (`0` means "start from header.head")
2. Call `__rt_hash_iter_next`
3. If `x0 == -1`, exit the loop
4. Otherwise save the returned cursor, store `x1`/`x2` into the optional key variable, and store `x3`/`x4`/`x5` into the value variable according to the inferred element type; `Mixed` loop variables reuse or allocate boxed mixed cells as needed
5. Emit the loop body, then branch back to the iterator call

This preserves PHP-style insertion order because `__rt_hash_iter_next` walks the hash table's linked insertion-order chain rather than scanning physical buckets.

See [The Runtime](the-runtime.md) for details on hash table routines and [Memory Model](memory-model.md) for the hash table memory layout.

## String indexing codegen

The same `ArrayAccess` AST node also covers string indexing such as `$str[1]` or `$str[-1]`. In `src/codegen/expr/arrays.rs`, `emit_array_access()` checks for `PhpType::Str` and lowers the operation inline:

1. Save the string pointer/length while evaluating the index expression
2. Adjust negative indices relative to the end of the string
3. Clamp offsets below `-len` to the start and offsets past the end to the end
4. Advance the string pointer to the selected byte
5. Return either a one-character string (`x1` + `x2 = 1`) or an empty string when the offset is out of bounds

So the behavior is slice-like, but it does not call `substr()` or a dedicated runtime helper.

## Statement codegen

**Files:** `src/codegen/stmt.rs`, `src/codegen/stmt/`

`emit_stmt()` is similarly split across focused helpers under `stmt/`: assignment/storage logic, array statements, include-once guards, and control-flow lowering (`branching`, `foreach`, `loops`) now live outside the thin top-level dispatcher. `stmt/includes.rs` emits the `.comm` flag and branch sequence used by resolver-generated `IncludeOnceMark` and `IncludeOnceGuard` nodes, plus the active-variant store used when an include point loads a hidden function implementation. Small shared statement-side policies such as borrowed-result retention, local-slot ownership updates, static-init guards, and indexed-array metadata stamping now sit in `stmt/helpers.rs` instead of bloating `stmt.rs` itself. Storage lowering is now split too: `stmt/storage.rs` is just a boundary, with `storage/locals.rs` handling ordinary global/static symbol access and `storage/extern_globals.rs` owning extern-global load/store conventions. Assignment lowering is also split one level deeper: `stmt/assignments/locals.rs` handles plain local/global/ref writes, while `stmt/assignments/properties.rs` now orchestrates property writes across `properties/target.rs`, `magic_set.rs`, and `storage.rs`. Array-index writes follow the same pattern now: `stmt/arrays/assign.rs` is just a dispatcher, while `stmt/arrays/assign/buffer.rs` and `assoc.rs` isolate the non-indexed-container paths, and `stmt/arrays/assign/indexed.rs` now orchestrates the indexed-array write across `indexed/prepare.rs`, `normalize.rs`, `store.rs`, and `extend.rs`. Branching lowering now follows that same shape too: `stmt/control_flow/branching.rs` is just a boundary, while `branching/if_stmt.rs` and `branching/switch_stmt.rs` own the distinct lowering paths. Exception lowering follows the same structure: `stmt/control_flow/exceptions.rs` orchestrates the high-level try/catch/finally flow, while `exceptions/handlers.rs`, `catches.rs`, and `finally.rs` own the lower-level handler stack, catch matching, and pending-action/finally dispatch mechanics. Loop lowering is split too: `stmt/control_flow/loops.rs` is now just a boundary, with `loops/iterative.rs` handling `for`/`while`/`do...while` and `loops/exits.rs` owning `break`/`continue`/`return`. `foreach` lowering now follows the same pattern: `stmt/control_flow/foreach.rs` dispatches between `foreach/indexed.rs`, `foreach/assoc.rs`, and `foreach/iterator.rs` for arrays, hashes, `Iterator`, `IteratorAggregate`, and object-backed `iterable` values.

### Statement AST dispatch coverage

The statement dispatcher maps `StmtKind` variants to storage, control-flow,
declaration, include, or extension paths:

| Variants | Lowering path |
|---|---|
| `Echo`, `ExprStmt`, `Throw`, `Synthetic` | Direct statement helpers, expression dispatch, exception throw, or already-lowered statement sequences |
| `Assign`, `RefAssign`, `TypedAssign`, `ArrayAssign`, `NestedArrayAssign`, `ArrayPush`, `ListUnpack`, `PropertyAssign`, `StaticPropertyAssign`, `PropertyArrayPush`, `PropertyArrayAssign`, `StaticPropertyArrayPush`, `StaticPropertyArrayAssign` | Local/global/static storage, reference aliasing, array storage, destructuring, and property storage helpers |
| `If`, `IfDef`, `While`, `DoWhile`, `For`, `Foreach`, `Switch`, `Try`, `Break`, `Continue`, `Return` | Branching, compile-time conditional lowering, loops, foreach dispatch, switch lowering, exception/finally control flow, loop exits, and return epilogues |
| `Include`, `IncludeOnceMark`, `IncludeOnceGuard`, `FunctionVariantGroup`, `FunctionVariantMark` | Resolver-produced include guards and include-loaded function variant activation |
| `NamespaceDecl`, `NamespaceBlock`, `UseDecl`, `ConstDecl` | Mostly frontend/name-resolution artifacts; constants remain available through the codegen context |
| `FunctionDecl`, `ClassDecl`, `EnumDecl`, `InterfaceDecl`, `TraitDecl`, `PackedClassDecl` | Deferred function/method emission and metadata-driven class, enum, interface, trait, and packed-record setup |
| `Global`, `StaticVar` | Symbol-backed local aliases and per-function static storage |
| `ExternFunctionDecl`, `ExternClassDecl`, `ExternGlobalDecl` | Registration-only at statement emission; expression/call lowering uses the collected FFI metadata |

### Echo and print

```php
echo $x;
echo "a", "b";
$status = print $x;
```

1. Evaluate each `echo` expression in source order → result in registers
2. Check for null/false (skip printing if so — matches PHP behavior where `echo false` prints nothing)
3. Call `emit_write_stdout()` from the [ABI module](#the-abi-module)

`print` expressions reuse the same stdout helper, then write integer `1` into
the expression result register so the value can be assigned, concatenated, or
passed into another expression.

### Assignment

```php
$x = expr;
```

1. Evaluate expression
2. If the result is a borrowed heap value, retain it before the local slot becomes a new owner
3. Release the previous owned heap value from `$x` when overwriting a heap-backed slot
4. `emit_store()` — write result to `$x`'s stack slot and classify the local slot as `Owned` for heap-backed types

Typed local declarations such as `int $x = 42;` or `buffer<int> $xs = buffer_new<int>(8);` share the same storage path after the checker has resolved `StmtKind::TypedAssign` into a concrete `PhpType`.

### Constant declaration

```php
const MAX = 100;
```

`ConstDecl` registers a compile-time constant. The value is stored in the codegen context and substituted directly wherever the constant is referenced via `ConstRef`. No runtime storage or stack allocation is needed.

### Global variables

```php
$x = 10;
function inc() {
    global $x;
    $x++;
}
```

The `global` statement inside a function declares that a variable refers to global storage rather than a local stack slot. The codegen uses BSS-allocated storage (`_gvar_NAME`, 16 bytes each) for global variables:

1. At `global $x;`: the variable is marked as global in the context. The current value is loaded from `_gvar_x` into the local stack slot.
   The local view is tracked as a borrowed alias of the BSS-backed owner.
2. On assignment to a global variable: the codegen writes to the BSS storage (`_gvar_x`) via `adrp`/`add`/`str` instead of (or in addition to) the local stack slot.
3. In `_main`: when the main scope assigns to a variable that any function declares as `global`, the value is also written to `_gvar_NAME` so that functions can read it.

### Extern declarations

`ExternFunctionDecl`, `ExternClassDecl`, and `ExternGlobalDecl` are registration-only statements during codegen. Their metadata has already been collected by the type checker and copied into `Context`, so `emit_stmt()` treats the declarations themselves as no-ops while later expression codegen uses the recorded FFI data.

Extern globals are loaded through GOT-relative addressing (`adrp ...@GOTPAGE` / `ldr ...@GOTPAGEOFF`) instead of ordinary stack or BSS slots.

### Static variables

```php
function counter() {
    static $count = 0;
    $count++;
    echo $count;
}
```

Static variables persist their value across function calls. Each static variable gets two BSS slots:

- `_static_FUNC_VAR` (16 bytes) — stores the persisted value
- `_static_FUNC_VAR_init` (8 bytes) — initialization flag (0 = not yet initialized)

The codegen for `static $count = 0;`:

1. Check the init flag — if already initialized, skip to loading the persisted value
2. If not initialized: evaluate the init expression, store to the BSS slot, set the init flag to 1
3. Load the persisted value into the local stack slot

That per-call local slot is tracked as `Borrowed`; the persisted static storage remains the long-lived owner.

At function epilogue, variables marked as static are written back to their BSS storage.

### Static properties

Static properties use one global 16-byte storage slot per effective declaring class property:

- `_static_prop_CLASS_PROP` stores the current value payload
- inherited static properties point back to the declaring class slot until a subclass redeclares the property
- redeclared static properties get a separate subclass slot

At program startup, `_main` evaluates static property defaults and stores them into these slots before user statements run. Reads such as `ClassName::$count` load directly from the resolved symbol, and assignments store the new result back to the same symbol after type coercion and previous-value release for heap-backed values. `static::$count` uses the forwarded called-class id (or `$this` in instance methods) to select a redeclared descendant slot at runtime; if that late-bound slot is private and inaccessible from the current method scope, generated code emits a fatal private-static-property diagnostic.

### List unpacking

```php
[$a, $b, $c] = [10, 20, 30];
```

Simple local positional destructuring remains a `ListUnpack` statement. The codegen:

1. Evaluates the right-hand side expression (an array)
2. Saves the array pointer on the stack
3. For each variable in the list: loads the element at the corresponding index from the array, stores it into the variable's stack slot, and marks heap-backed elements as borrowed aliases of the source container

Richer PHP destructuring patterns are lowered by the parser into ordinary synthetic assignments before checking and codegen. Skipped entries simply emit no assignment, keyed entries become array reads with the given key, nested patterns bind a hidden temporary for the nested source array, and non-local targets reuse the same assignment emitters as `$arr[$i] = ...`, `$arr[] = ...`, `$obj->prop = ...`, and static-property writes.