### Statements (`Stmt`)

Things that do something:

Each `Stmt` also carries a source `span` and an `attributes` list. The list is populated only for declaration statements that can legally be decorated with PHP attributes; attributes before non-declaration statements are rejected during parsing.

| Variant | Example |
|---|---|
| `Echo(Expr)` | `echo $x;`; multi-argument `echo $a, $b;` lowers to a `Synthetic` sequence of `Echo` statements |
| `Assign { name, value }` | `$x = 42;` |
| `RefAssign { target, source }` | `$y =& $x;` — reference aliasing where both target and source are plain variables |
| `If { condition, then_body, elseif_clauses, else_body }` | `if (...) { } elseif (...) { } else { }` |
| `While { condition, body }` | `while (...) { }` |
| `DoWhile { body, condition }` | `do { } while (...);` |
| `For { init, condition, update, body }` | `for (...; ...; ...) { }` — `init`, `condition`, and `update` are all optional, so `for (;;) { }` is valid |
| `Foreach { array, key_var, value_var, value_by_ref, body }` | `foreach ($arr as $v) { }`, `foreach ($arr as $k => $v) { }`, or `foreach ($arr as &$v) { }` |
| `Switch { subject, cases, default }` | `switch ($x) { case 1: ...; default: ... }` |
| `ArrayAssign { array, index, value }` | `$arr[0] = 5;` |
| `NestedArrayAssign { target, value }` | `$arr[0][1] = 5;`, `$obj->items[0] = 5;` |
| `ArrayPush { array, value }` | `$arr[] = 5;` |
| `TypedAssign { type_expr, name, value }` | `int $x = 42;`, `buffer<int> $xs = buffer_new<int>(8);` |
| `FunctionDecl { name, params, variadic, return_type, body }` | `function foo(int $a, &$b, string $c = "x"): string { }` — params is `Vec<(String, Option<TypeExpr>, Option<Expr>, bool)>` where the tuple stores name, declared type, default value, and `is_ref` (pass by reference). `variadic` is `Option<String>` for variadic parameters (`...$args`) and `return_type` is an optional declared `TypeExpr` |
| `FunctionVariantGroup { name, variants }` | Internal resolver metadata for include-loaded hidden function implementations behind one public name |
| `FunctionVariantMark { name, variant }` | Internal include-body marker that activates the hidden function variant loaded at that runtime include point |
| `Return(Option<Expr>)` | `return $x;` or `return;` |
| `Break(usize)` | `break;`, `break 2;` |
| `Continue(usize)` | `continue;`, `continue 2;` |
| `Include { path, once, required }` | `include 'file.php';` |
| `IncludeOnceMark { label }` | Internal resolver lowering for regular `include` / `require`, marking the resolved file as loaded for later `*_once` guards |
| `IncludeOnceGuard { label, body }` | Internal resolver lowering for `include_once` / `require_once`; codegen checks a per-file flag before emitting the guarded body |
| `Throw(Expr)` | `throw new Exception("boom");` |
| `Synthetic(Vec<Stmt>)` | Internal lowering only; a source construct that has already been expanded into one or more ordinary statements before final codegen |
| `Try { try_body, catches, finally_body }` | `try { ... } catch (Exception $e) { ... } finally { ... }` |
| `ConstDecl { name, value }` | `const MAX = 100;` |
| `IfDef { symbol, then_body, else_body }` | `ifdef DEBUG { ... } else { ... }` |
| `NamespaceDecl { name: Option<Name> }` | `namespace App\Core;`, `namespace;` |
| `NamespaceBlock { name: Option<Name>, body }` | `namespace App\Core { ... }`, `namespace { ... }` |
| `UseDecl { imports }` | `use App\Lib\Tool;`, `use function App\fn as helper;`, `use Vendor\Pkg\{Thing, Other as Alias};` |
| `ListUnpack { vars, value }` | `[$a, $b] = [1, 2];` for simple local positional destructuring; skipped, keyed, nested, and non-local destructuring patterns lower to `Synthetic` assignment statements |
| `Global { vars }` | `global $x, $y;` — declares variables as referencing global storage |
| `StaticVar { name, init }` | `static $count = 0;` — declares a variable that persists across function calls |
| `ClassDecl { name, extends, implements, is_abstract, is_final, is_readonly_class, trait_uses, properties, constants, methods }` | `final readonly class Point extends Shape implements Named { use NamedTrait; ... }` |
| `EnumDecl { name, backing_type, cases, implements, methods, constants }` | `enum Status: int { case Ok = 1; case Err = 2; }` |
| `PackedClassDecl { name, fields }` | `packed class Vec2 { public float $x; public float $y; }` |
| `InterfaceDecl { name, extends, properties, methods, constants }` | `interface Named extends Stringable { public string $name { get; } public function name(): string; }` |
| `TraitDecl { name, trait_uses, properties, constants, methods }` | `trait Named { public const KIND = "name"; ... }` |
| `PropertyAssign { object, property, value }` | `$p->x = 10;` |
| `StaticPropertyAssign { receiver, property, value }` | `Counter::$count = 10;`, `self::$count = 10;` |
| `StaticPropertyArrayPush { receiver, property, value }` | `Counter::$items[] = 10;`, `self::$items[] = 10;` |
| `StaticPropertyArrayAssign { receiver, property, index, value }` | `Counter::$items[0] = 10;`, `self::$items[0] = 10;` |
| `PropertyArrayPush { object, property, value }` | `$p->items[] = 10;` |
| `PropertyArrayAssign { object, property, index, value }` | `$p->items[0] = 10;` |
| `ExternFunctionDecl { name, params, return_type, library }` | `extern function foo(int $x): int;` or entries inside `extern "lib" { ... }` — `params` is `Vec<ExternParam>`, where each `ExternParam` stores `{ name, c_type }`, and `return_type` is a `CType` |
| `ExternClassDecl { name, fields }` | `extern class Point { public int $x; }` |
| `ExternGlobalDecl { name, c_type }` | `extern global ptr $environ;` — the declared type is a C-facing `CType`, not a `PhpType` |
| `ExprStmt(Expr)` | `my_func();` (expression used as statement) |

Constructor property promotion is normalized during class-body parsing. A parameter such as `public int $id` in `__construct` becomes a `ClassProperty` plus a synthetic leading `PropertyAssign` statement equivalent to `$this->id = $id;`. Parameter defaults stay on the constructor signature rather than `ClassProperty.default`, matching PHP's distinction between promoted parameter defaults and property defaults. By-reference promoted parameters preserve a `by_ref` flag on the generated property so codegen can bind the property slot to the referenced argument or to a heap reference cell when a default value is used. Later passes otherwise see ordinary properties and ordinary constructor assignments.

### Statement dispatch

At statement level, parsing is split between `parser/mod.rs` and the `stmt/` submodules:

- `parse()` in `mod.rs` special-cases `extern` so one `extern "lib" { ... }` block can expand into multiple AST statements.
- Everything else flows through `stmt::parse_stmt()`, which selects the parser entry point from the current token.

| Current token | Parse as |
|---|---|
| `Class` / `Abstract Class` / `Final Class` / `Readonly Class` / combined class modifiers | Class declaration |
| `Enum` | Enum declaration |
| `Packed` | Packed-class declaration |
| `Interface` | Interface declaration |
| `Trait` | Trait declaration |
| `Function` | Function declaration |
| `Namespace` | Namespace declaration |
| `Use` | Namespace import declaration |
| `Return` | Return statement |
| `Throw` | Throw statement |
| `Echo` | Echo statement |
| `Print` | Generic expression statement containing `Print(...)` |
| `If` / `While` / `Do` / `For` / `Foreach` / `Switch` / `Try` | Control-flow statement |
| `Const` / `Global` / `Static` | Declaration-like statement |
| `Variable` / `This` / `Identifier` / `Backslash` / `Self_` / `Parent` / `Static::...` | Assignment, property write, call, or generic expression statement |

This is intentionally narrower than full PHP statement syntax. In the current subset, expression statements only enter through the token arms handled by `stmt::parse_stmt()` above; starting a statement with tokens such as `match`, `new`, `fn`, a literal, `(`, or a unary operator still produces an "unexpected token at statement position" parser error unless that construct appears inside another statement form.

## Error recovery

The parser does not stop at the first syntax error anymore. It now performs conservative synchronization at statement boundaries and block boundaries so one malformed statement does not necessarily prevent later statements from being parsed and reported.

Current recovery behavior is intentionally simple:

- top-level parsing can skip forward to the next plausible statement boundary after a syntax error
- block parsing (`{ ... }`) can resynchronize on `;`, `}`, and `EOF`
- the parser still prefers correctness over aggressive recovery, so heavily malformed input may still collapse into fewer diagnostics than an IDE-style parser would produce

### Binary operators (`BinOp`)

```
Add  Sub  Mul  Div  Mod  Pow  Concat
Eq  NotEq  StrictEq  StrictNotEq  Lt  Gt  LtEq  GtEq  Spaceship
And  Or  Xor
BitAnd  BitOr  BitXor  ShiftLeft  ShiftRight
NullCoalesce
```

`instanceof` is represented as `ExprKind::InstanceOf` rather than `BinOp` because PHP has special RHS grammar: named targets (`User`, `self`, `parent`, `static`) are resolved like class names, while variable/property/array targets and parenthesized expressions are evaluated dynamically.

### Type expressions (`TypeExpr`)

Parsed type annotations use `TypeExpr` before the checker resolves them into
`PhpType` values:

```
Int  Float  Bool  Str  Void  Never  Iterable
Ptr(Option<Name>)  Buffer(Box<TypeExpr>)  Named(Name)
Nullable(Box<TypeExpr>)  Union(Vec<TypeExpr>)
```

`Iterable` represents PHP's `iterable` pseudo-type in parameter, return,
property, and typed-local annotations. Nullable shorthand (`?T`) and explicit
unions (`T|U`) are represented separately so the checker can reject invalid
forms such as `?T|U` and normalize accepted declarations.

### Class-related types

`ClassDecl` uses several supporting types:

| Type | Fields | Description |
|---|---|---|
| `Visibility` | `Public`, `Protected`, `Private` | Enum for property/method visibility |
| `Attribute` | `name`, `args`, `span` | A PHP 8 attribute entry from a `#[...]` group. The parser validates names and optional argument expressions. Class, method, and property names plus supported literal args feed `class_attribute_names()`, `class_attribute_args()`, `class_get_attributes()`, and the supported Reflection `getAttributes()` APIs; parameter reflection is not implemented yet. |
| `AttributeGroup` | `attributes`, `span` | One bracketed attribute group. Declaration sites can carry one or more groups. |
| `EnumCaseDecl` | `name`, `value`, `span`, `attributes` | A backed or unit enum case declaration, with declaration-level attributes preserved in the AST. |
| `ClassConst` | `name`, `visibility`, `is_final`, `value`, `span`, `attributes` | A class, interface, or trait constant declaration. |
| `ClassProperty` | `name`, `visibility`, `type_expr`, `hooks`, `readonly`, `is_final`, `is_static`, `is_abstract`, `by_ref`, `default`, `span`, `attributes` | A property declaration inside a class, trait, or interface, optionally carrying a parsed property type declaration, hook contract, static-property marker, by-reference promotion marker, or declaration-level attributes |
| `ClassMethod` | `name`, `visibility`, `is_static`, `is_abstract`, `is_final`, `has_body`, `params`, `variadic`, `return_type`, `body`, `span`, `attributes` | A method declaration inside a class, trait, or interface |
| `CatchClause` | `exception_types`, `variable`, `body` | A catch arm. `exception_types` supports both single-type and PHP-style multi-catch (`TypeA | TypeB`), and `variable` is optional for PHP 8-style `catch (Exception)` |
| `StaticReceiver` | `Named(Name)`, `Self_`, `Static`, `Parent` | Left-hand side of `ClassName::method()`, `self::method()`, `static::method()`, and `parent::method()` |
| `TraitUse` | `trait_names`, `adaptations`, `span` | A `use TraitA, TraitB { ... }` clause inside a class or trait body |
| `TraitAdaptation` | `Alias { trait_name: Option<Name>, method, alias: Option<String>, visibility: Option<Visibility> }`, `InsteadOf { trait_name: Option<Name>, method, instead_of: Vec<Name> }` | PHP-style trait conflict resolution and aliasing |
| `UseItem` / `UseKind` | `kind`, `name`, `alias` | Namespace import entries for `use`, `use function`, `use const`, and group-use declarations |
| `CallableTarget` | `Function(Name)`, `StaticMethod { receiver, method }`, `Method { object, method }` | Structured target of first-class callable syntax such as `foo(...)` or `Cls::bar(...)` |

Every AST node carries a `Span` (line + column) from the source, so error messages in later phases can point to the right location.

## The Pratt parser

**File:** `src/parser/expr/`

Parsing expressions with operators is the hardest part. Consider:

```php
1 + 2 * 3 ** 4
```

This should parse as `1 + (2 * (3 ** 4))` because `**` binds tighter than `*`, which binds tighter than `+`. And `**` is right-associative (`2 ** 3 ** 4` = `2 ** (3 ** 4)`), while `+` and `*` are left-associative.

elephc uses a **Pratt parser** (also called top-down operator precedence parser) to handle this elegantly. The key idea: every operator has a **binding power** — a pair of numbers (left, right) that determine how tightly it grabs its operands.