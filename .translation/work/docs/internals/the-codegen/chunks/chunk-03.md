### Constant references

```php
const MAX = 100;
echo MAX;
```

Constants declared with `const` or `define()` are resolved at compile time. When the codegen encounters a `ConstRef`, it looks up the constant's value and emits it as a literal — `mov x0, #100` for an integer, or loads a string label from the data section. `define()` call sites still emit a per-constant runtime seen flag so the call returns `true` only for the first runtime definition and returns `false` with a suppressible warning on duplicate attempts.

Enum cases reuse the same idea, but through enum metadata instead of scalar constants: parser output uses `ExprKind::ScopedConstantAccess` for `Color::Red`, and codegen detects enum receivers to load the canonical enum-case symbol emitted in runtime data. Helper builtins such as `Enum::from()` / `Enum::tryFrom()` lower through the checker/codegen enum tables carried in `Context`; a missing `Enum::from()` value constructs a catchable `ValueError` with the PHP-compatible backing-value message.

### Pointer values and casts

Pointer expressions are carried in `x0` as plain 64-bit addresses:

- `ptr($var)` computes the address of a stack or global slot and returns it in `x0`
- `ptr_null()` loads the zero address
- `ptr_cast<T>($p)` only changes the static type tag seen by the checker, so codegen emits the inner expression and leaves the address unchanged
- Pointer printing routes through `__rt_ptoa`, which formats the address as a `0x...` string before writing

### Buffer allocation and packed hot-path access

`buffer_new<T>(len)` lowers directly from `ExprKind::BufferNew`: codegen evaluates the element count, loads the checked element stride from the type metadata, and calls `__rt_buffer_new`. The resulting pointer in `x0` references a contiguous `[length][stride][payload...]` block rather than a PHP array/hash structure.

When `T` is a scalar POD type, reads and writes use direct address arithmetic from the buffer base plus `index * stride`. When `T` is a `packed class`, codegen combines the buffer element stride with the field offset from `packed_classes` metadata and emits direct typed loads/stores into the packed payload.

### Function calls

```php
my_func($a, $b, $c)
```

1. Evaluate each argument and push results onto the stack
2. Pop arguments into the correct ABI registers (`x0`-`x7` for ints, `d0`-`d7` for floats, two registers per string)
3. If a heap-backed argument is being borrowed from an existing owner (for example a local variable or container read), retain it before passing it to the callee
4. `bl _fn_my_func` — branch with link (saves return address)
5. Result is in `x0`/`d0`/`x1`+`x2` depending on return type

Named-argument calls split evaluation order from ABI order. `src/codegen/expr/calls/args.rs` evaluates source arguments left-to-right, stores any out-of-order values in temporary slots, validates spread prefixes after later named expressions have run, then materializes the final parameter list in ABI order. Spread prefixes before named arguments are evaluated once; multiple prefix spreads are combined before runtime length/overwrite checks, and too-short positional spreads for required parameters fail instead of reading beyond the array payload. Runtime associative-array spreads are dynamic named providers: they look up string keys by parameter name, fall back to numeric keys for positional slots, and let the per-parameter missing/default branch decide whether a required value is present. Built-in and extern named calls use the same source-order pre-evaluation step before their normalized positional emitters run; mutating built-ins mark their target parameter as ref-like so pre-evaluation does not redirect writes into a temporary. Extern calls preserve PHP source evaluation order first and only then load C ABI registers.

## Closure codegen

### Anonymous functions and arrow functions

Closures (`function($x) { ... }`) and arrow functions (`fn($x) => ...`) are compiled as separate labeled functions, similar to user-defined functions. The key difference is **deferred emission** — the closure body is not emitted inline. Instead:

1. **At the closure expression site**: the codegen generates a unique entry label (e.g., `_closure_1`), creates a static callable descriptor in `.data`, and loads the descriptor address into `x0`. The descriptor includes side records for signature/default/by-reference/variadic metadata, capture and hidden-parameter bindings, and invocation shape. The descriptor pointer is then stored in the variable's stack slot as a `Callable` (8 bytes).

2. **The body is deferred**: the closure's parameter list, body statements, captured variables, and label are pushed onto `ctx.deferred_closures`. This avoids emitting function code in the middle of the current function's instruction stream.

3. **After `_main`**: all deferred closures are emitted as standalone labeled functions (prologue, body, epilogue), just like user-defined functions.

### `use` captures

Closures can capture variables from the enclosing scope via `use ($var1, $var2)`:

```php
$greeting = "Hello";
$fn = function($name) use ($greeting) {
    echo $greeting . " " . $name;
};
```

Only explicit `use (...)` captures are stored in the AST and forwarded as hidden closure arguments. Arrow functions are still parsed as closures, but they use `is_arrow = true` with an empty `captures` list.

The AST stores captured variable names in the `captures` field of the `Closure` expression. At the call site, captured variables are passed as **extra arguments** after the explicit arguments:

1. **At the closure expression site**: the captured variable names and types are recorded in `ctx.closure_captures` alongside the deferred closure.
2. **At the call site** (`$fn("World")`): the codegen looks up the captured variables, evaluates them from the caller's scope, and passes them as additional arguments after the explicit ones.
3. **In the closure body**: the captured values arrive as extra parameters and are stored in local stack slots, making them accessible like regular local variables.

This means captures are passed **by value** — modifying a captured variable inside the closure does not affect the outer scope (matching PHP semantics).

### Closure calls

When a closure variable is called (`$fn(1, 2)`), the codegen:

1. Evaluates each argument and pushes results onto the stack
2. Loads the closure descriptor from the variable's stack slot into `x9`
3. Loads the native entry address from the descriptor's entry slot
4. Pushes `x9` temporarily while popping arguments into ABI registers
5. Pops `x9` back and calls `blr x9` — an indirect branch through a register

`blr` (Branch with Link to Register) is like `bl` but the target address comes from a register rather than a label. This is what makes closures work — the compiler doesn't know at compile time which function will be called, so it uses an indirect jump.