### Binding power table

```
Operator          Left BP    Right BP    Associativity
─────────────────────────────────────────────────────
or                  1          2         left
xor                 3          4         left
and                 5          6         left
assignment          7          6         RIGHT (variable targets)
? : / ?:            7          7         right-ish ternary parse
??                  9          8         RIGHT (null coalescing)
||                 11         12         left
&&                 13         14         left
|  (bitwise OR)    15         16         left
^  (bitwise XOR)   17         18         left
&  (bitwise AND)   19         20         left
== != === !==      21         22         left
< > <= >= <=>      23         24         left
|>                 24         25         left (dedicated Pipe node)
<< >>              25         26         left
.  (concat)        27         28         left
+ -                29         30         left
* / %              31         32         left
instanceof         35         special    left, named-or-dynamic RHS
unary (- ! ~)          35                prefix
**                 37         36         RIGHT (r < l)
```

**Left-associative** operators have `right_bp > left_bp`. This means `1 + 2 + 3` parses as `(1 + 2) + 3`.

**Right-associative** operators have `right_bp < left_bp`. This means `2 ** 3 ** 4` parses as `2 ** (3 ** 4)`.

For `??`, the Pratt table still uses `BinOp::NullCoalesce` to assign binding power, but the parser builds a dedicated `ExprKind::NullCoalesce { value, default }` node rather than a generic `BinaryOp`.

For `instanceof`, the Pratt loop handles the keyword at expression level and then parses either a class/interface target name or a dynamic target expression. Its binding power matches PHP's behavior where `!$obj instanceof User` parses as `!($obj instanceof User)`.

For `|>`, the Pratt loop handles `Token::PipeArrow` before the generic `BinOp` table and builds `ExprKind::Pipe { value, callable }`. The binding power `(24, 25)` places it below concatenation, shifts, and arithmetic, but above comparisons, `??`, ternary, logical operators, and assignment. This matches PHP 8.5 and keeps pipe-specific validation, such as requiring parenthesized arrow-function targets, out of generic binary-operator lowering.

The word-form logical operators (`and`, `xor`, `or`) have PHP's lower precedence. The symbolic `&&` and `||` continue to bind more tightly.

The full ternary form builds `ExprKind::Ternary`. The omitted-middle form `expr ?: fallback` builds `ExprKind::ShortTernary` so later phases can preserve PHP's single-evaluation rule for the left-hand expression.

Assignment expressions build `ExprKind::Assignment { target, value, result_target, prelude, conditional_value_temp }`. Their binding power matches PHP's low-precedence assignment slot, so `$x = true and false` parses as `($x = true) and false`, while `$x = $y = 1` remains right-associative. Standalone variable assignment statements still lower to `StmtKind::Assign` unless a lower-precedence word logical operator requires the whole statement to be represented as an expression statement.

For non-local expression targets, the parser emits hidden assignment prelude statements when a receiver, index, or RHS must be evaluated exactly once before the final write. The lowered `target` is the write target, `result_target` is the expression read after the write, and `prelude` contains temporary assignments such as the captured result of `idx()` in `$items[idx()] = value()` or the RHS value in `$items[$i] = ($i = 1)`. This keeps codegen on the normal assignment paths while preserving PHP's evaluation order for plain and compound assignment expressions. For `??=`, `conditional_value_temp` reserves a hidden temporary that codegen fills only in the null branch, preserving PHP's conditional RHS evaluation for targets such as `$items[$i] ??= ($i = 1)`.

### The algorithm

```
parse_expr_bp(min_bp):
    1. Parse prefix (literal, variable, unary op, parenthesized expr, ...)
       → this is the "left" node

    2. Loop:
       a. Look at the next token — is it an infix operator?
       b. Get its (left_bp, right_bp)
       c. If left_bp < min_bp → stop (operator doesn't bind tight enough)
       d. Consume the operator
       e. Parse right side: parse_expr_bp(right_bp)
       f. Build BinaryOp(left, op, right) → this becomes the new "left"
       g. Continue loop

    3. The `?` arm handles both full ternary (`? :`) and short ternary (`?:`)

    Return left
```

### Walkthrough: `1 + 2 * 3`

```
parse_expr_bp(0):
  prefix → IntLiteral(1)

  loop iteration 1:
    next token: +  → (left_bp=29, right_bp=30)
    29 >= 0? yes → consume +
    parse_expr_bp(30):
      prefix → IntLiteral(2)
      loop iteration:
        next token: *  → (left_bp=31, right_bp=32)
        31 >= 30? yes → consume *
        parse_expr_bp(32):
          prefix → IntLiteral(3)
          loop: no more operators
          return IntLiteral(3)
        build: Mul(Int(2), Int(3))
      loop: no more operators
      return Mul(Int(2), Int(3))
    build: Add(Int(1), Mul(Int(2), Int(3)))

  loop: no more operators
  return Add(Int(1), Mul(Int(2), Int(3)))
```

Result: `1 + (2 * 3)` — correct!

The beauty of Pratt parsing is that you add a new operator by adding one line to the binding power table. No grammar rules to rewrite, no ambiguity to resolve.

### Prefix parsing

Before looking for infix operators, the parser handles **prefix** constructs — things that start an expression:

| Prefix | What it parses |
|---|---|
| `IntLiteral` | Return `IntLiteral` node |
| `FloatLiteral` | Return `FloatLiteral` node |
| `StringLiteral` | Return `StringLiteral` node |
| `true` / `false` | Return `BoolLiteral` node |
| `null` | Return `Null` node |
| `Variable` | Return `Variable` node (with postfix `++`/`--` check) |
| `throw` | Parse the following expression at the lowest precedence and wrap it in `ExprKind::Throw` |
| `print` | Parse the operand at ternary-level precedence (bp=7, above word logical operators) and wrap it in `ExprKind::Print` |
| `yield` | Parse `yield`, `yield expr`, `yield key => value`, or contextual `yield from expr` |
| `-` (minus) | Parse inner expr at unary precedence (bp=35), return `Negate` |
| `!` (not) | Parse inner expr at unary precedence (bp=35), return `Not` |
| `~` (bitwise not) | Parse inner expr at unary precedence (bp=35), return `BitNot` |
| `@` (error control) | Parse inner expr at unary precedence (bp=35), return `ErrorSuppress` |
| `++` / `--` | Return `PreIncrement` / `PreDecrement` |
| `(int)` / `(float)` / ... | Parse inner expr, return `Cast` |
| `(` | Parse inner expr, expect `)`, return inner expr (and allow a later postfix call like `(expr)(args)`) |
| `[` | Parse comma-separated exprs, expect `]`, return `ArrayLiteral` |
| `match` + `(` | Parse `match (...) { ... }` → `Match` |
| `Identifier` / `\Identifier` / qualified name + `(` | Parse as function call with arguments |
| `Identifier` / `\Identifier` / qualified name + `(...)` | Parse as first-class callable → `FirstClassCallable(CallableTarget::Function)` |
| `Identifier` / `\Identifier` / qualified name (no `(`) | Parse as constant reference → `ConstRef` |
| `function` + `(` | Parse anonymous function (closure) → `Closure` |
| `fn` + `(` | Parse arrow function → `Closure` (with `is_arrow = true`) |
| `static` + `function` / `fn` + `(` | Parse static closure → `Closure` (with `is_static = true`); the type checker rejects `$this` inside the body |
| `new` + qualified name | Parse object instantiation → `NewObject` |
| `new` + `$var` + `(` | Parse dynamic object instantiation → `NewDynamic` (class named by a runtime variable) |
| `new` + `self` / `static` / `parent` + `(` | Parse scoped object instantiation → `NewScopedObject` |
| `<receiver>::class` | Parse `MyClass::class`, `\App\C::class`, `self::class`, `parent::class`, `static::class` → `ClassConstant` |
| `$this` | Return `This` node |
| `...` + expr | Parse spread/unpack → `Spread` |
| `ptr_cast` + `<Type>` + `(` | Parse pointer cast syntax → `PtrCast` |
| `buffer_new` + `<Type>` + `(` | Parse contiguous-buffer allocation → `BufferNew` |
| `__DIR__` / `__FILE__` / other magic constants | Parse magic constants → `MagicConstant` (`__LINE__` becomes `IntLiteral`) |

### Postfix: calls, array access, and member access

After parsing a prefix, the parser checks for postfix operators:

- `(` for calling the result of an expression (`ExprCall`)
- `[` for array access
- `->` for property access or method call
- `?->` for nullsafe property access or method call
- `::` for enum-case lookup, static method call, or static-method first-class callable (when the prefix is a parsed name)

At statement level, `stmt.rs` also parses `trait` declarations and class/trait-body `use` clauses. That `use` handling is intentionally context-sensitive so it does not interfere with closure capture lists like `function () use ($x) { ... }`.

```php
$arr[0]          →  ArrayAccess { array: Variable("arr"), index: IntLiteral(0) }
$arr[$i + 1]     →  ArrayAccess { array: Variable("arr"), index: BinaryOp(Add, ...) }
$p->x            →  PropertyAccess { object: Variable("p"), property: "x" }
$p->move(1, 2)   →  MethodCall { object: Variable("p"), method: "move", args: [...] }
$p?->x           →  NullsafePropertyAccess { object: Variable("p"), property: "x" }
$p?->move(1, 2)  →  NullsafeMethodCall { object: Variable("p"), method: "move", args: [...] }
Point::origin()  →  StaticMethodCall { receiver: Named("Point"), method: "origin", args: [] }
\Lib\Factory::make() → StaticMethodCall { receiver: Named("\\Lib\\Factory"), method: "make", args: [] }
parent::boot()   →  StaticMethodCall { receiver: Parent, method: "boot", args: [] }
```

## Statement parsing

**Files:** `src/parser/stmt/`, `src/parser/control.rs`

Statement parsing is simpler — after `parse()` has peeled off top-level `extern` blocks, `stmt.rs` looks at the current token to decide what kind of statement to parse:

| Current token | Parse as |
|---|---|
| `Echo` | `Echo` statement — parse one or more comma-separated expressions, expect `;` |
| `Print` | Expression statement — parse `Print(...)`, expect `;` |
| `Throw` | `Throw` statement — parse one expression, expect `;` |
| `IfDef` | Build-time conditional statement |
| `Variable` | Assignment, compound assignment, array assign/push, or expression statement |
| `If` | `If` with optional `elseif` chain and `else` |
| `Try` | `Try` with one or more `catch` clauses and optional `finally` |
| `While` | `While` loop |
| `Do` | `DoWhile` loop |
| `For` | `For` loop with init/condition/update |
| `Foreach` | `Foreach` loop |
| `Switch` | `Switch` statement with cases and optional default |
| `Function` | Function declaration with parameters and body |
| `Class` / `Abstract Class` / `Final Class` / `Readonly Class` / combined class modifiers | Class declaration with properties and methods |
| `Enum` | Enum declaration |
| `Packed` | Packed class declaration |
| `Interface` | Interface declaration |
| `Trait` | Trait declaration with trait uses, properties, and methods |
| `Extern` | Handled one level up in `parser/mod.rs` via `parse_extern_stmts()` |
| `Return` | Return with optional expression |
| `Break` | Break statement with optional positive integer level |
| `Continue` | Continue statement with optional positive integer level |
| `Include` / `Require` / `IncludeOnce` / `RequireOnce` | Include statement (path is parsed as an expression and later folded by the resolver when it is a compile-time string) |
| `Const` | Constant declaration (`const NAME = value;`) |
| `Namespace` | Namespace declaration (`namespace App\Core;` or `namespace App\Core { ... }`) |
| `Use` | Namespace import declaration (`use Foo\Bar;`, `use function Foo\bar as baz;`) |
| `Global` | Global variable declaration (`global $x, $y;`) |
| `Static` | Static variable declaration (`static $count = 0;`) |
| `[` | List destructuring (`[$a, , $c] = expr;`, `["id" => $id] = expr;`) |
| `Identifier` + `(` | Expression statement (function call) |
| Internal lowering, no source token | `Synthetic` statement sequence used for temporary-backed lowering of effectful compound assignment targets |