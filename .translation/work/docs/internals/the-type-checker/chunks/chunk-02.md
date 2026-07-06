## Built-in function signatures

**Files:** `src/types/checker/builtins/`, plus `src/types/checker/mod.rs` and `src/types/checker/inference/` for special expression forms such as `ExprKind::PtrCast`, `ExprKind::InstanceOf`, and `ExprKind::Print`

Every built-in function has a registered type signature:

```
strlen($str: Str) → Int
substr($str: Str, $start: Int, $len?: Int) → Str
strpos($hay: Str, $needle: Str) → Int|Bool
array_search($needle, $arr: Array|AssocArray) → Int|Str|Bool
file_get_contents($filename: Str) → Str|Bool
fopen($filename: Str, $mode: Str) → resource<stream>|Bool
fileatime($filename: Str) / filectime($filename: Str) → Int|Bool
fileperms($filename: Str) / fileowner($filename: Str) / filegroup($filename: Str) / fileinode($filename: Str) → Int|Bool
filetype($filename: Str) → Str|Bool
stat($filename: Str) / lstat($filename: Str) / fstat($handle: resource<stream>) → AssocArray|Bool
define($name: Str, $value: scalar) → Bool
count($arr: Array|AssocArray) → Int
abs($val: Int|Float) → Int|Float
floor($val: Int|Float) → Float
rand($min?: Int, $max?: Int) → Int
ptr($var: lvalue) → Pointer(None)
ptr_get($ptr: Pointer) → Int
ptr_set($ptr: Pointer, $value: Int|Bool|Void|Pointer) → Void
ptr_cast<T>($ptr: Pointer) → Pointer(Some(T))
```

Most entries in the table above come from the builtin signature registry, while pointer-tag casts like `ptr_cast<T>()` are checked directly when the type checker visits `ExprKind::PtrCast`. `instanceof` is also checked as a dedicated expression: it always returns `Bool`, validates named `self` / `parent` / `static` targets against the current class context, checks dynamic target expressions for ordinary expression validity, and deliberately allows unknown named targets so runtime behavior can return `false` like PHP. For some built-ins the checker also enforces container shape, not just raw argument count:

- `array_push($arr, $val)` requires the first argument to be an indexed `Array`, not an `AssocArray`
- `array_column($rows, $column_key)` requires the first argument to be an indexed array whose element type is `AssocArray`
- `wordwrap()` accepts 1 to 4 arguments, matching the builtin checker

The type checker validates:

1. **Argument count** — too few or too many arguments → error
2. **Argument types** — wrong types → error (in some cases; many builtins accept multiple types)
3. **Return type** — used to infer the type of the call expression

## User-defined function checking

**File:** `src/types/checker/functions.rs`

When the type checker encounters a function declaration, it:

1. **Collects all function declarations** in a first pass (so functions can be called before they're defined)
2. **Creates a local type environment** for the function body (separate from global scope)
3. **Resolves declared parameter types** when type hints are present, and otherwise falls back to the existing defaults / inference path
4. **Resolves the declared return type** when present, and otherwise infers it from `return` expressions
5. **Validates defaults, call sites, and return statements** against the declared types, including PHP-style default parameters such as `int $x = 10` and named-argument reordering against the declared parameter names
6. **Stores the `FunctionSig`** — parameter count, parameter types, return type, reference parameters, and variadic parameter

The `FunctionSig` struct:

```rust
pub struct FunctionSig {
    pub params: Vec<(String, PhpType)>,
    pub defaults: Vec<Option<Expr>>,
    pub return_type: PhpType,
    pub declared_return: bool,        // whether return_type came from an explicit return hint
    pub ref_params: Vec<bool>,         // which parameters are pass-by-reference (&$param)
    pub declared_params: Vec<bool>,    // whether each parameter came from an explicit type hint
    pub variadic: Option<String>,      // variadic parameter name (...$args), if any
    pub deprecation: Option<String>,   // #[Deprecated] reason; "" when no reason was supplied
}
```

- `ref_params` tracks which parameters use `&` (pass by reference). The codegen passes the stack address of the argument instead of its value.
- `declared_params` lets later phases distinguish explicit PHP type hints from inferred/defaulted parameter types.
- `declared_return` lets later phases distinguish explicit PHP return hints from inferred return types.
- `variadic` holds the name of the variadic parameter (e.g., `$args` in `function foo(...$args)`). Extra arguments beyond the regular parameters are collected into an array.
- `deprecation` carries PHP 8.4 `#[Deprecated]` metadata when present, so call sites can surface the warning consistently.

### Call-site inference for untyped parameters

Parameters without a type hint start from an `Int` fallback and are specialized from the actual argument types observed at call sites. The checker accumulates the argument types seen across *all* call sites for each undeclared parameter: a parameter called with a single type takes that type, while a parameter called with incompatible types (e.g. `int` at one site and `string` at another) widens to a `Union` so each argument keeps its own runtime representation instead of being coerced to the last-seen type. A union whose members are all `int`/`bool` collapses back to `Int` (preserving the int fallback for int- or bool-only calls), and a `void` argument never specializes a parameter. Because `Union` lowers to the same boxed runtime shape as `Mixed`, such arguments are boxed at the call site and unboxed where they are used.

The same accumulation applies to instance-method and static-method parameters. Closure parameters specialize to the first observed argument type but do not widen to a union, so a closure invoked with incompatible argument types is rejected rather than coerced.

This information is then used when checking calls to that function.

### Type narrowing (`is_*` / `instanceof` guards)

Inside an `if` guarded by a type predicate on a single variable, the checker narrows that variable's type for the guarded branch. `is_int`/`is_integer`/`is_long`, `is_float`/`is_double`, `is_string`, and `is_bool` narrow to the corresponding scalar; `$x instanceof Class` narrows to that class. The then-branch sees the guarded type and the else-branch sees the complement (a `Union` drops the matched members); a leading `!` swaps the two. A guard with no `else` whose body always diverges (`return`/`throw`) narrows the statements after the `if` to the complement. This is what makes the common "overload" shape type-check:

```php
function set($x): void {                 // $x inferred int|Foo from the call sites
    if (is_int($x)) { $this->n = $x; }   // $x is int here -> stored into an int property
    else { $this->o = $x->run(); }       // $x is Foo here -> method dispatched on its class
}
```

Narrowing is purely a type-checker step: the variable keeps its boxed runtime (`Mixed`) representation, and codegen coerces it where the narrowed type is required — unboxing for scalar uses, and dispatching a method on a `Mixed`/union receiver by its runtime class id. Narrowing is not flow-sensitive across reassignment of the variable within a branch.

## Diagnostics and warnings

The checker is no longer strictly first-error-only. Many passes now accumulate independent semantic errors and return them as a grouped diagnostic instead of aborting immediately on the first failure.

After successful checking, elephc also runs a warning pass over the AST. Current warnings include:

- unused local variables and parameters
- unreachable code

Warnings are returned through `CheckResult` and printed by the CLI without failing the compilation.

## Where the checker sits in the optimizer pipeline

The type checker sits between an early folding pass and four post-check cleanup passes in `src/optimize/`:

- `fold_constants()` runs first and simplifies scalar expressions that are already statically decidable.
- `propagate_constants()` runs after successful checking and pushes known scalar locals through conservative straight-line and merge shapes.
- `prune_constant_control_flow()` runs only after successful checking and warning collection, so dead branches can be removed without suppressing type errors or warnings that should still be reported.
- `normalize_control_flow()` runs after pruning and rewrites structurally equivalent control-flow shells into simpler AST shapes.
- `eliminate_dead_code()` runs after normalization and removes the leftover unreachable or non-observable statements.

That ordering is intentional. elephc is happy to rewrite `2 + 3` into `5` before checking, but it does not want an optimization pass to make broken code look valid by deleting it too early.

## The global environment

Before checking user code, the type checker pre-populates the environment with built-in globals:

```rust
global_env.insert("argc", PhpType::Int);
global_env.insert("argv", PhpType::Array(Box::new(PhpType::Str)));
```

These correspond to PHP's `$argc` and `$argv` superglobals.

## Interface type checking

Before `ClassInfo` is built, the checker flattens trait composition through `src/types/traits.rs`, builds `InterfaceInfo` entries for every interface, and only then builds class metadata recursively.

```rust
pub struct InterfaceInfo {
    pub interface_id: u64,
    pub parents: Vec<String>,
    pub properties: HashMap<String, PropertyHookContract>,
    pub property_order: Vec<String>,
    pub methods: HashMap<String, FunctionSig>,
    pub method_declaring_interfaces: HashMap<String, String>,
    pub method_order: Vec<String>,
    pub method_slots: HashMap<String, usize>,
    pub constants: HashMap<String, Expr>,   // interface constants (PHP 5.0+)
}
```

For each interface, the checker resolves `interface extends interface` transitively, rejects inheritance cycles, flattens required methods into a single signature map, and assigns a stable method ordering used by runtime metadata emission. `properties` records PHP 8.4 property hook contracts required by the interface, and `constants` carries interface constants inherited from parent interfaces.