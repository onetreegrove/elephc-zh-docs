### Variadic parameters and spread operator

```php
function sum(...$nums) { /* $nums is an array */ }
sum(1, 2, 3);
sum(...$arr);  // spread
```

**Variadic functions**: The last parameter can be prefixed with `...` to collect all remaining arguments into an array. At the call site, the codegen:

1. Passes regular (non-variadic) arguments normally via registers
2. Uses the shared helpers in `src/codegen/expr/calls/args.rs` to prepare normalized/defaulted argument lists, lower pass-by-reference slots, handle spread-into-named parameters, and build the trailing variadic array when needed
3. Passes the array pointer as the last argument register

**Spread operator** (`...$arr`): When calling a function with `...$arr`, the array is unpacked into positional parameters. For `function f($a, ...$rest)`, `f(...[1, 2, 3])` passes `1` to `$a` and collects `[2, 3]` into `$rest`. Associative-array spreads map string keys to named arguments, keep numeric keys positional, and collapse duplicate static string keys to the last value before planning. Variable `AssocArray` spreads before named arguments can satisfy later parameters by string key at runtime, so codegen skips fixed prefix length checks for that dynamic provider and emits per-parameter lookup/default handling instead. In array literals, the spread operator uses `__rt_array_merge_into` to append all elements from the spread array into the target array.

### Default parameter values

Functions and closures support default parameter values:

```php
function greet($name, $greeting = "Hello") { ... }
```

When a call site omits an argument that has a default value, the codegen fills in the default. At the call site, the compiler checks how many arguments were actually passed and, for each missing parameter with a default, evaluates the default expression and places it in the appropriate argument register. This is handled at compile time — no runtime checks are needed.

### `collect_local_vars()`

Pre-scans the function body AST to find every variable that will be used. This is necessary because stack space must be allocated in the prologue, before any code runs.

It walks the statement tree before code emission and handles the major local-binding forms recursively (`Assign`, control-flow blocks, `For`/`Foreach`, `ListUnpack`, `Global`, `StaticVar`, and related cases). The exact match is implementation-driven in the `functions/` module, so this list is illustrative rather than exhaustive.

## Main program codegen

**File:** `src/codegen/mod.rs`

The `generate()` function orchestrates everything:

1. **Emit user functions** — scan AST for `FunctionDecl`, emit each one
2. **Emit class methods** — constructor, instance methods, and static methods use their own labels
3. **Emit `_main`**:
   - Prologue (stack frame for global variables)
   - Save `argc` and `argv` from OS (they arrive in `x0` and `x1`)
   - Build `$argv` array via `__rt_build_argv` runtime call
   - Register the main activation record so exceptions can unwind through top-level code too
   - Emit all non-function statements
   - Epilogue: clean up owned locals, unregister the activation record, then `exit(0)`
4. **Emit deferred closures** — closure bodies recorded during earlier expression codegen
5. **Emit runtime routines** — all `__rt_*` helper functions
6. **Emit data section** — string and float literals
7. **Emit runtime data / BSS** — global buffers, globals, statics, and lookup tables

Linux x86_64 uses the same shared runtime emission surface as the AArch64 targets. Array transforms, sorting helpers, copy-on-write paths, GC accounting, heap debug helpers, string search/formatting helpers, inline array/string accessors, and list unpacking all route through target-aware emitters and the ABI module rather than a separate reduced runtime slice.

When an operation needs architecture-specific assembly, the leaf runtime module selects the native sequence internally. For example, x86_64 helpers use SysV registers, RIP-relative addressing, and x86_64 heap markers where needed, while AArch64 helpers use their own register and relocation conventions. Higher-level lowering should continue to call the shared runtime labels and ABI helpers instead of branching on raw ARM64 or x86_64 details.