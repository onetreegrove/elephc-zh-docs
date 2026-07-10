**Source:** `src/types/` — `mod.rs`, `model.rs`, `traits.rs`, `checker/mod.rs`, `checker/driver/`, `checker/builtin_interfaces.rs`, `checker/builtin_iterators.rs`, `checker/builtin_json.rs`, `checker/builtin_spl_exceptions.rs`, `checker/builtin_stdclass.rs`, `checker/builtin_types/`, `checker/builtins/`, `checker/functions.rs`, `checker/functions/`, `checker/inference/`, `checker/stmt_check.rs`, `checker/stmt_check/`, `checker/type_compat.rs`, `checker/type_compat/`, `checker/schema/`, `checker/yield_validation/`, `warnings/`

PHP is dynamically typed — variables can change type at runtime. But elephc compiles to native code where every value must have a known size and location. The type checker bridges this gap by **inferring types at compile time**.

## Why type checking matters

The [code generator](the-codegen.md) needs to know types to emit correct assembly:

- An `Int` lives in register `x0` (8 bytes)
- A `Float` lives in register `d0` (8 bytes)
- A `String` lives in `x1` (pointer) + `x2` (length) = 16 bytes

If the code generator doesn't know whether `$x` is an integer or a string, it doesn't know which registers to use, how many bytes to allocate on the stack, or which comparison instruction to emit (`cmp` for integers vs `fcmp` for floats).

## The type system

**File:** `src/types/model.rs`

elephc has a small type system:

```rust
pub enum PhpType {
    Int,
    Float,
    Str,
    Bool,
    Void,                          // null
    Never,                         // marks a function/method that never returns (always throws / exits / loops)
    Iterable,                      // PHP `iterable` pseudo-type (array | Traversable), type-erased
    Mixed,                         // runtime-boxed heterogeneous array / user mixed value
    Array(Box<PhpType>),           // e.g., Array(Int) = int[]
    AssocArray {                    // e.g., AssocArray { key: Str, value: Int }
        key: Box<PhpType>,
        value: Box<PhpType>,
    },
    Buffer(Box<PhpType>),
    Callable,                      // closures and function references
    Object(String),                // class instance, e.g., Object("Point") or Object("App\\Point")
    Packed(String),
    Pointer(Option<String>),       // opaque ptr or typed ptr<Class>
    Resource(Option<String>),      // generic resource or typed resource such as resource<stream>
    Union(Vec<PhpType>),
    TaggedScalar,                  // codegen-internal inline nullable scalar: {payload, tag} pair
}
```

This is still much smaller than full PHP's runtime type system, but it now includes user-written union and nullable annotations where the language subset supports them. `Union(...)` values are lowered to the same boxed runtime representation used by `Mixed`. `TaggedScalar` is never produced by the checker itself: codegen funnels construct it from `int|null` unions under the tagged null representation (the default; see `--null-repr`), storing the value as an inline two-word `{payload, tag}` pair instead of a heap-boxed cell. The distinction between `Array` (indexed) and `AssocArray` (key-value) is determined at compile time from the literal syntax (`[1, 2]` vs `["a" => 1]`), and heterogeneous payloads in either representation widen to boxed `Mixed` elements.

`Never` is a return-position-only marker: a function annotated `: never` must always diverge (throw, call `exit()`/`die()`, or loop forever). The type checker rejects any reachable `return value;` from such a function, and the runtime size is zero because the value is never materialized. `: never` is rejected as a parameter or local-variable type — same restriction as `: void`.

`Iterable` represents PHP's `iterable` pseudo-type (`array | Traversable`). It is treated as a type-erased 8-byte raw heap pointer at runtime — the checker accepts `Array`, `AssocArray`, `Iterator` objects, and `IteratorAggregate` objects for parameters declared `iterable`, and `foreach` over an `iterable` local types both `$key` and `$value` as `Mixed`. Direct operations on iterable values (`foreach`, `echo`, `gettype()`, `var_dump()`, `===`, scalar casts, `is_iterable()`) dispatch through the `__rt_heap_kind` runtime helper. Indexed-array iterables use the value-type tag stored in the array header to box loop values as `Mixed`; associative iterables reuse the hash iterator payload tag; object-backed iterables branch through interface metadata and then use the `Iterator` method dispatch path.

`Callable` is used for anonymous functions (closures), arrow functions, and first-class callables. Closure and first-class callable values are stored as one 8-byte descriptor pointer. The descriptor carries the callable kind, native entry ABI slot, optional PHP-visible name, signature/environment/invocation metadata, and an optional generated invoker slot. Dynamic-call builtins reuse that metadata and generated wrapper cases to invoke runtime-selected user functions, supported builtin string callbacks, public static-method strings, callable arrays, and invokable objects.

`Object(String)` represents a class instance. The string carries the canonical class name after name resolution (for example `"Point"` or `"App\\Point"`). Objects are heap-allocated pointers (8 bytes on the stack).

`Pointer(Option<String>)` represents a raw 64-bit address. `Pointer(None)` is an opaque pointer, while `Pointer(Some("Point"))` is a pointer tagged with a checked pointee type. The tag affects static checking, but the runtime value is still just an address in `x0`.

`Resource(Option<String>)` represents PHP resource handles. `Resource(None)` is a generic resource, while `Resource(Some("stream"))` is the stream-handle shape used by successful `fopen()` calls and the `STDIN` / `STDOUT` / `STDERR` constants. Resource values are stored as one 8-byte native payload in codegen, but the type checker keeps them distinct from integers so stream built-ins can reject plain numeric descriptors.

## How inference works

The type checker walks the AST top-down, maintaining a **type environment** — a `HashMap<String, PhpType>` that maps variable names to their types. It also tracks a **constants map** — a `HashMap<String, PhpType>` that records the type of each user-defined constant (declared via `const` or `define()`).

### Assignments create types

```php
$x = 42;          // $x: Int (inferred from the literal)
$name = "Alice";   // $name: Str
$pi = 3.14;       // $pi: Float
$ok = true;       // $ok: Bool
$nothing = null;   // $nothing: Void
```

The first assignment determines a variable's type. After that, reassignment is only allowed to the same type (with some exceptions):

### Type compatibility rules

| From | To | Allowed? |
|---|---|---|
| `Int` | `Int` | Yes |
| `Int` | `Float` | Yes (numeric types are interchangeable) |
| `Int` | `Bool` | Yes (numeric/bool interchangeable) |
| `Int` | `Str` | **No** — compile error |
| `Void` | anything | Yes (null can become any type) |
| anything | `Void` | Yes (any variable can become null) |
| `Array(T)` | `Array(U)` | Yes, if `T` and `U` merge; heterogeneous indexed values widen to `Array(Mixed)` |
| `AssocArray(_, T)` | `AssocArray(_, U)` | Yes, if `T` and `U` merge; heterogeneous values widen to `Mixed` |
| `Pointer(None)` | `Pointer(Some("T"))` | Yes (merged to the more specific pointer tag) |
| `Pointer(Some("A"))` | `Pointer(Some("B"))` | Yes, but merged to opaque `Pointer(None)` if tags differ |
| `Pointer(*)` | `Int` / `Str` / `Array` | **No** — compile error |
| `Resource(None)` | `Resource(Some("stream"))` (or vice versa) | Yes (generic resource accepts typed resources) |
| `Resource(Some("stream"))` | `Int` | **No** — stream handles are not plain numeric descriptors |
| `Array(_)` / `AssocArray(_, _)` / object implementing `Iterator` or `IteratorAggregate` | `Iterable` parameter | Yes (PHP `iterable` accepts arrays and Traversable objects at the call boundary) |

This means elephc rejects code that PHP would allow:

```php
$x = 42;
$x = "hello";  // ← Type error: cannot reassign $x from Int to Str
```

This is intentional — it lets the compiler know exactly what `$x` is at every point, without needing runtime type tags.

## Statement checks

Statement checking validates control-flow constraints that are not expression
types. `foreach` accepts indexed arrays, associative arrays, values typed
`Iterable`, and objects/interfaces that implement `Iterator` or
`IteratorAggregate`. Indexed and associative array loops bind key/value
variables to inferred element/key types; `Iterable` and object-backed iterator
loops bind them as `Mixed` because concrete payload tags are discovered at
runtime. `break` and `continue` track the active loop/switch target depth, so
`break 2;` is accepted only when two enclosing break/continue targets exist in
the current function or closure body. Function, method, and closure bodies reset
that depth so an inner declaration cannot target an outer loop. `finally` bodies
also record the target depth at entry: `break` or `continue` may target
loops/switches created inside that `finally`, but jumping out of a `finally`
block is rejected to match PHP.

## Expression type inference

The type checker computes the type of every expression:

### Literals

| Expression | Type |
|---|---|
| `42` | `Int` |
| `3.14` | `Float` |
| `"hello"` | `Str` |
| `true` / `false` | `Bool` |
| `null` | `Void` |
| `[1, 2, 3]` | `Array(Int)` |
| `[1, "two", true]` | `Array(Mixed)` |
| `["a" => 1]` | `AssocArray { key: Str, value: Int }` |
| `["a" => 1, "b" => "two"]` | `AssocArray { key: Str, value: Mixed }` |

### Binary operations

| Operation | Types | Result |
|---|---|---|
| `Int + Int` | arithmetic | `Int` |
| `Float + Float` | arithmetic | `Float` |
| `Int + Float` | mixed arithmetic | `Float` |
| `Int / Int` | division | `Float` (always — matches PHP) |
| `Int % Int` | modulo | `Int` |
| `Str . Str` | concatenation | `Str` |
| `Int . Str` | concat with coercion | `Str` |
| `Int > Int` | comparison | `Bool` |
| `Bool && Bool`, `Bool and Bool`, `Bool xor Bool` | logical | `Bool` |
| `Int & Int` | bitwise | `Int` |
| `Int <=> Int` | spaceship | `Int` (-1, 0, or 1) |
| `expr instanceof ClassName` | class/interface metadata check | `Bool` |
| `expr ?? expr` | null coalescing | Type of the non-null operand |
| `print expr` | output expression | `Int` (`1`) |

### Function calls

Built-in functions have hardcoded type signatures (see below). User-defined functions, methods, constructors, closures, and arrow functions can carry declared parameter hints; functions, methods, closures, and arrow functions can carry declared return type hints. Declared non-`void` returns are validated both against returned values and against reachable fallthrough paths, while `throw`, `exit()`/`die()`, and provably infinite loops count as non-returning paths. Closure / arrow return annotations are represented in the AST and threaded into callable `FunctionSig` metadata; unannotated closures continue to infer their return type from the body or expression. Named arguments are validated against the declared parameter list before the usual argument-count and type checks run, including built-ins, extern calls, associative-array spreads with string keys, and spread prefixes that fill earlier positional slots. Variable `AssocArray` spreads before named arguments are treated as dynamic named providers, so required-parameter diagnostics are kept only when no preceding associative spread could provide the missing parameter at runtime. Unknown named arguments on user-defined variadic functions are accepted and typed as part of the variadic parameter, while built-in variadics reject unknown named arguments like PHP internal functions do. Positional spreads into variadic callees fill regular parameters first, then type the remaining tail as the variadic array.

Codegen receives enough signature information to evaluate named/spread arguments in PHP source order while still materializing values in ABI parameter order.