**Source:** `src/parser/` — `expr/`, `stmt/`, `control.rs`, `attributes.rs`, `ast/`, `mod.rs`

The parser takes the token stream from the [lexer](the-lexer.md) and builds an **Abstract Syntax Tree** (AST) — a tree structure that represents the program's meaning, not just its text.

## What is an AST?

An AST strips away syntactic noise (parentheses, semicolons, braces) and captures the **structure** of the program:

```php
echo 1 + 2 * 3;
```

The tokens are flat: `Echo, Int(1), Plus, Int(2), Star, Int(3), Semicolon`. But the AST is a tree:

```
Echo
 └── BinaryOp(Add)
      ├── IntLiteral(1)
      └── BinaryOp(Mul)
           ├── IntLiteral(2)
           └── IntLiteral(3)
```

The tree encodes that `2 * 3` happens before `+ 1` — **operator precedence** is baked into the structure. The parser is responsible for getting this right.

## The AST types

**File:** `src/parser/ast/`

The AST has two main node types:

### Expressions (`Expr`)

Things that have a value:

| Variant | Example | Notes |
|---|---|---|
| `IntLiteral(i64)` | `42` | |
| `FloatLiteral(f64)` | `3.14` | |
| `StringLiteral(String)` | `"hello"` | Escapes already resolved by lexer |
| `BoolLiteral(bool)` | `true`, `false` | |
| `Null` | `null` | |
| `Variable(String)` | `$x` | Name without `$` |
| `BinaryOp { left, op, right }` | `$a + $b` | See operator table below |
| `InstanceOf { value, target }` | `$obj instanceof User`, `$obj instanceof $className` | Class/interface runtime type check. The target is either a named class/interface target or a dynamic target expression. |
| `Negate(Expr)` | `-$x` | Unary minus |
| `Not(Expr)` | `!$x` | Logical NOT |
| `BitNot(Expr)` | `~$x` | Bitwise NOT (complement) |
| `Throw(Expr)` | `throw new Exception("boom")` | Throw expression node used both in statements and expression positions such as `??` or ternaries |
| `Print(Expr)` | `print $x` | PHP print expression. It writes the operand and returns `1`; statement-form `print $x;` is represented as `ExprStmt(Print(...))`. |
| `NullCoalesce { value, default }` | `$x ?? $y` | Returns `$x` if non-null, otherwise `$y` |
| `Pipe { value, callable }` | `$x |> trim(...)`, `$x |> (fn($v) => $v + 1)` | PHP 8.5 pipe operator. Dedicated node, not a `BinOp`, so later passes can preserve left-hand evaluation before the callable target and emit pipe-specific diagnostics. Arrow functions used as targets must be parenthesized. |
| `Assignment { target, value, result_target, prelude, conditional_value_temp }` | `$x = 1`, `$arr[$i] ??= "fallback"` | Assignment expression. Complex targets can carry prelude statements and synthetic temporaries so side effects are evaluated once while the assignment still returns the assigned value. |
| `PreIncrement(String)` | `++$i` | Returns new value |
| `PostIncrement(String)` | `$i++` | Returns old value |
| `PreDecrement(String)` | `--$i` | |
| `PostDecrement(String)` | `$i--` | |
| `FunctionCall { name, args }` | `strlen($s)`, `Tools\fmt($s)`, `\strlen($s)` | Parsed as a structured name so later phases can resolve namespace aliases and fully-qualified names |
| `Yield { key, value }` | `yield`, `yield $v`, `yield $k => $v` | Yield expression inside a generator body. The parser keeps optional key/value expressions; later checker/codegen turns the enclosing function or closure into a `Generator` state machine. |
| `YieldFrom(Expr)` | `yield from inner()` | Contextual `yield from` delegation. The lexer leaves `from` as an identifier and the parser recognizes it only immediately after `yield`. |
| `ArrayLiteral(Vec<Expr>)` | `[1, 2, 3]`, `[...$arr, 4]` | Indexed array; elements may include `Spread` expressions |
| `ArrayLiteralAssoc(Vec<(Expr, Expr)>)` | `["a" => 1]` | Associative array |
| `Match { subject, arms, default }` | `match($x) { 1, 2 => "low", 3 => "high" }` | Match expression (returns a value). `arms` is `Vec<(Vec<Expr>, Expr)>`, so each arm can have multiple comma-separated patterns before `=>`, and `default` is optional (`Option<Box<Expr>>`) |
| `ArrayAccess { array, index }` | `$arr[0]`, `$str[-1]` | Same AST node is used for indexed arrays, associative-array lookups, and string indexing |
| `Ternary { condition, then_expr, else_expr }` | `$a ? $b : $c` | |
| `ShortTernary { value, default }` | `$a ?: $fallback` | PHP short ternary / Elvis form. Codegen evaluates `value` once, returns it if truthy, otherwise returns `default`. |
| `ErrorSuppress(Expr)` | `@file_get_contents("missing.txt")` | PHP error-control prefix expression. Codegen wraps the operand in a runtime warning-suppression scope. |
| `Cast { target, expr }` | `(int)$x` | |
| `Closure { params, variadic, variadic_type, return_type, body, is_arrow, is_static, captures, capture_refs }` | `function(int $x = 1) use ($y, &$z): string { ... }`, `fn(int $x): int => $x * 2`, or `static function(): int { ... }` | Anonymous function / arrow function. Params is `Vec<(String, Option<TypeExpr>, Option<Expr>, bool)>` - name, declared type, default, is_ref. `variadic` is an optional parameter name and `variadic_type` its optional declared element type (`int ...$xs`). `return_type` stores the optional declared closure / arrow return `TypeExpr`. `captures` stores by-value captures and `capture_refs` stores `use (&$var)` captures. Arrow functions are still represented as `Closure`, parse with `is_arrow = true`, and do not carry explicit `use (...)` captures in the AST. `is_static` is set when the closure is prefixed with the `static` keyword (PHP `static function () {}` / `static fn () => ...`); the type checker rejects any reference to `$this` inside a static closure. |
| `NamedArg { name, value }` | `foo(name: "Alice")` | Named call argument. The parser preserves source order; later phases validate names against the declared parameter list and normalize known-signature calls for ABI lowering. |
| `ClosureCall { var, args }` | `$fn(1, 2)` | Calling a closure stored in a variable |
| `ExprCall { callee, args }` | `$arr[0](1, 2)` | Calling the result of an expression (e.g., array access returning a callable) |
| `Spread(Expr)` | `...$arr` | Spread/unpack operator — expands an array into individual arguments or elements |
| `IncludeValue { path, once, required }` | `$x = require 'f.php';`, `return include $p;` | Transient node for an `include`/`require` used in expression position. The resolver fully expands it (inlining the included file in the caller's scope and capturing its top-level `return`), so no later phase ever sees it. |
| `ConstRef(Name)` | `MAX_RETRIES`, `Config\PORT`, `\App\Config\PORT` | Reference to a user-defined constant |
| `NewObject { class_name, args }` | `new Point(1, 2)`, `new App\Model\User()` | Object instantiation |
| `NewDynamic { name_expr, args }` | `new $cls(1, 2)` | Object instantiation where the class name comes from a runtime string expression. Resolved through the runtime class table at codegen time (`__rt_new_by_name`). |
| `NewScopedObject { receiver, args }` | `new self()`, `new static()`, `new parent()` | Object instantiation against a static receiver. Distinct from `NewObject` (which carries a fixed `Name`) so codegen can honour late static binding for `static`. |
| `NewDynamicObject { class_name, fallback_class, required_parent, args }` | (internal) | Synthetic factory used by compiler-provided methods that construct an object from a runtime class-string while constraining it to a known parent class. Not produced from source syntax. |
| `PropertyAccess { object, property }` | `$p->x` | Property access via `->` |
| `DynamicPropertyAccess { object, property }` | `$p->{$name}` | Dynamic property access where the property name is an expression. Dynamic method calls are intentionally rejected. |
| `NullsafePropertyAccess { object, property }` | `$p?->x` | Nullsafe property access via `?->` |
| `NullsafeDynamicPropertyAccess { object, property }` | `$p?->{$name}` | Nullsafe dynamic property access. If the receiver is null, the property expression and the rest of the chain are skipped. |
| `StaticPropertyAccess { receiver, property }` | `Point::$count`, `self::$count`, `parent::$count`, `static::$count` | Class-scoped property access via `::`, where `receiver` is a named class, `Self_`, `Static`, or `Parent` |
| `MethodCall { object, method, args }` | `$p->move(1, 2)` | Instance method call |
| `NullsafeMethodCall { object, method, args }` | `$p?->move(1, 2)` | Nullsafe instance method call; PHP rejects `?->method(...)` closure creation, so elephc reports `Cannot combine nullsafe operator with Closure creation` for that form |
| `StaticMethodCall { receiver, method, args }` | `Point::origin()`, `self::boot()`, `parent::boot()`, `static::boot()` | Static-style call via `::`, where `receiver` is a named class, `Self_`, `Static`, or `Parent` |
| `FirstClassCallable(CallableTarget)` | `strlen(...)`, `Tools\fmt(...)`, `Math::twice(...)` | PHP-style first-class callable syntax; the target is preserved structurally instead of being parsed as a call |
| `This` | `$this` | Reference to the current object inside a method |
| `PtrCast { target_type, expr }` | `ptr_cast<Point>($p)` | Pointer-tag cast parsed specially after `ptr_cast<T>` |
| `BufferNew { element_type, len }` | `buffer_new<int>(256)` | Compiler extension for contiguous hot-path buffers |
| `MagicConstant(MagicConstant)` | `__DIR__`, `__CLASS__` | Parsed from case-insensitive magic-constant tokens. `__LINE__` is lowered immediately to `IntLiteral`; the remaining magic constants are lowered by `src/magic_constants.rs` before type checking. |
| `ClassConstant { receiver }` | `MyClass::class`, `\App\C::class`, `self::class`, `parent::class`, `static::class` | The PHP `::class` reflection literal. Codegen lowers it to a string literal carrying the fully-qualified class name. `static::class` follows late static binding. |
| `ScopedConstantAccess { receiver, name }` | `MyClass::LIMIT`, `self::DEFAULT_SIZE` | User-declared class constant access through `::`; later phases resolve the receiver and constant metadata. |