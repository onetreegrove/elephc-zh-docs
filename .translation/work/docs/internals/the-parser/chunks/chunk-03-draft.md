### 绑定力表

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

**左结合**运算符有 `right_bp > left_bp`。这意味着 `1 + 2 + 3` 会解析为 `(1 + 2) + 3`。

**右结合**运算符有 `right_bp < left_bp`。这意味着 `2 ** 3 ** 4` 会解析为 `2 ** (3 ** 4)`。

对于 `??`，Pratt 表仍使用 `BinOp::NullCoalesce` 来分配绑定力，但解析器会构建专用的 `ExprKind::NullCoalesce { value, default }` 节点，而不是通用 `BinaryOp`。

对于 `instanceof`，Pratt loop 会在表达式层级处理该关键字，然后解析类/接口目标名称或动态目标表达式。它的绑定力匹配 PHP 的行为：`!$obj instanceof User` 会解析为 `!($obj instanceof User)`。

对于 `|>`，Pratt loop 会先于通用 `BinOp` 表处理 `Token::PipeArrow`，并构建 `ExprKind::Pipe { value, callable }`。绑定力 `(24, 25)` 让它低于连接、位移和算术运算，但高于比较、`??`、三元、逻辑运算符和赋值。这与 PHP 8.5 匹配，并把管道专用验证（例如要求箭头函数目标加括号）留在通用二元运算符 lowering 之外。

单词形式的逻辑运算符（`and`、`xor`、`or`）拥有 PHP 的较低优先级。符号形式的 `&&` 和 `||` 继续绑定得更紧。

完整三元形式会构建 `ExprKind::Ternary`。省略中间操作数的形式 `expr ?: fallback` 会构建 `ExprKind::ShortTernary`，这样后续阶段可以保留 PHP 对左侧表达式只求值一次的规则。

赋值表达式会构建 `ExprKind::Assignment { target, value, result_target, prelude, conditional_value_temp }`。它们的绑定力匹配 PHP 的低优先级赋值槽，因此 `$x = true and false` 会解析为 `($x = true) and false`，而 `$x = $y = 1` 仍保持右结合。独立的变量赋值语句仍会降为 `StmtKind::Assign`，除非较低优先级的单词逻辑运算符要求整个语句表示为表达式语句。

对于非本地表达式目标，当 receiver、index 或 RHS 必须在最终写入前精确求值一次时，解析器会发出隐藏的赋值 prelude 语句。lowering 后的 `target` 是写入目标，`result_target` 是写入后的表达式读取，`prelude` 包含临时赋值，例如 `$items[idx()] = value()` 中捕获的 `idx()` 结果，或 `$items[$i] = ($i = 1)` 中的 RHS 值。这让 codegen 能继续使用普通赋值路径，同时为普通赋值和复合赋值表达式保留 PHP 的求值顺序。对于 `??=`，`conditional_value_temp` 会预留一个隐藏临时变量，codegen 只在 null 分支中填充它，从而为 `$items[$i] ??= ($i = 1)` 这样的目标保留 PHP 的条件 RHS 求值行为。

### 算法

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

### 演练：`1 + 2 * 3`

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

结果：`1 + (2 * 3)`，正确！

Pratt parsing 的优势在于，新增一个运算符只需在绑定力表里添加一行。不需要改写语法规则，也不需要消解歧义。

### 前缀解析

在查找中缀运算符之前，解析器会处理**前缀**结构，即那些可以开始一个表达式的东西：

| 前缀 | 解析内容 |
|---|---|
| `IntLiteral` | 返回 `IntLiteral` 节点 |
| `FloatLiteral` | 返回 `FloatLiteral` 节点 |
| `StringLiteral` | 返回 `StringLiteral` 节点 |
| `true` / `false` | 返回 `BoolLiteral` 节点 |
| `null` | 返回 `Null` 节点 |
| `Variable` | 返回 `Variable` 节点（并检查 postfix `++`/`--`） |
| `throw` | 以最低优先级解析后续表达式，并包裹为 `ExprKind::Throw` |
| `print` | 以三元级别优先级（bp=7，高于单词逻辑运算符）解析操作数，并包裹为 `ExprKind::Print` |
| `yield` | 解析 `yield`、`yield expr`、`yield key => value` 或上下文相关的 `yield from expr` |
| `-` (minus) | 以一元优先级（bp=35）解析内部 expr，返回 `Negate` |
| `!` (not) | 以一元优先级（bp=35）解析内部 expr，返回 `Not` |
| `~` (bitwise not) | 以一元优先级（bp=35）解析内部 expr，返回 `BitNot` |
| `@` (error control) | 以一元优先级（bp=35）解析内部 expr，返回 `ErrorSuppress` |
| `++` / `--` | 返回 `PreIncrement` / `PreDecrement` |
| `(int)` / `(float)` / ... | 解析内部 expr，返回 `Cast` |
| `(` | 解析内部 expr，期望 `)`，返回内部 expr（并允许后续 postfix call，例如 `(expr)(args)`） |
| `[` | 解析逗号分隔的 expr，期望 `]`，返回 `ArrayLiteral` |
| `match` + `(` | 解析 `match (...) { ... }` → `Match` |
| `Identifier` / `\Identifier` / qualified name + `(` | 解析为带参数的函数调用 |
| `Identifier` / `\Identifier` / qualified name + `(...)` | 解析为 first-class callable → `FirstClassCallable(CallableTarget::Function)` |
| `Identifier` / `\Identifier` / qualified name (no `(`) | 解析为常量引用 → `ConstRef` |
| `function` + `(` | 解析匿名函数（闭包）→ `Closure` |
| `fn` + `(` | 解析箭头函数 → `Closure`（带 `is_arrow = true`） |
| `static` + `function` / `fn` + `(` | 解析 static closure → `Closure`（带 `is_static = true`）；类型检查器会拒绝 body 中的 `$this` |
| `new` + qualified name | 解析对象实例化 → `NewObject` |
| `new` + `$var` + `(` | 解析动态对象实例化 → `NewDynamic`（类名来自运行时变量） |
| `new` + `self` / `static` / `parent` + `(` | 解析 scoped object instantiation → `NewScopedObject` |
| `<receiver>::class` | 解析 `MyClass::class`、`\App\C::class`、`self::class`、`parent::class`、`static::class` → `ClassConstant` |
| `$this` | 返回 `This` 节点 |
| `...` + expr | 解析 spread/unpack → `Spread` |
| `ptr_cast` + `<Type>` + `(` | 解析指针转换语法 → `PtrCast` |
| `buffer_new` + `<Type>` + `(` | 解析连续 buffer 分配 → `BufferNew` |
| `__DIR__` / `__FILE__` / other magic constants | 解析魔术常量 → `MagicConstant`（`__LINE__` 变成 `IntLiteral`） |

### 后缀：调用、数组访问和成员访问

解析完前缀后，解析器会检查后缀运算符：

- `(`，用于调用表达式结果（`ExprCall`）
- `[`，用于数组访问
- `->`，用于属性访问或方法调用
- `?->`，用于 nullsafe 属性访问或方法调用
- `::`，用于 enum-case 查找、static 方法调用或 static-method first-class callable（当前缀是已解析名称时）

在语句层级，`stmt.rs` 还会解析 `trait` 声明和 class/trait body 中的 `use` 子句。这里的 `use` 处理有意保持上下文相关，因此不会干扰 `function () use ($x) { ... }` 这样的闭包捕获列表。

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

## 语句解析

**文件：** `src/parser/stmt/`、`src/parser/control.rs`

语句解析更简单：在 `parse()` 剥离顶层 `extern` 块之后，`stmt.rs` 会查看当前 token 来决定解析哪种语句：

| 当前 token | 解析为 |
|---|---|
| `Echo` | `Echo` 语句：解析一个或多个逗号分隔的表达式，期望 `;` |
| `Print` | 表达式语句：解析 `Print(...)`，期望 `;` |
| `Throw` | `Throw` 语句：解析一个表达式，期望 `;` |
| `IfDef` | 构建期条件语句 |
| `Variable` | 赋值、复合赋值、数组赋值/追加，或表达式语句 |
| `If` | 带可选 `elseif` 链和 `else` 的 `If` |
| `Try` | 带一个或多个 `catch` 子句和可选 `finally` 的 `Try` |
| `While` | `While` 循环 |
| `Do` | `DoWhile` 循环 |
| `For` | 带 init/condition/update 的 `For` 循环 |
| `Foreach` | `Foreach` 循环 |
| `Switch` | 带 case 和可选 default 的 `Switch` 语句 |
| `Function` | 带参数和 body 的函数声明 |
| `Class` / `Abstract Class` / `Final Class` / `Readonly Class` / combined class modifiers | 带属性和方法的类声明 |
| `Enum` | enum 声明 |
| `Packed` | packed class 声明 |
| `Interface` | interface 声明 |
| `Trait` | 带 trait uses、属性和方法的 trait 声明 |
| `Extern` | 在 `parser/mod.rs` 中由上一级通过 `parse_extern_stmts()` 处理 |
| `Return` | 带可选表达式的 Return |
| `Break` | 带可选正整数层级的 Break 语句 |
| `Continue` | 带可选正整数层级的 Continue 语句 |
| `Include` / `Require` / `IncludeOnce` / `RequireOnce` | Include 语句（path 会解析为表达式，稍后如果是编译期字符串则由 resolver 折叠） |
| `Const` | 常量声明（`const NAME = value;`） |
| `Namespace` | namespace 声明（`namespace App\Core;` 或 `namespace App\Core { ... }`） |
| `Use` | namespace import 声明（`use Foo\Bar;`、`use function Foo\bar as baz;`） |
| `Global` | 全局变量声明（`global $x, $y;`） |
| `Static` | static 变量声明（`static $count = 0;`） |
| `[` | list 解构（`[$a, , $c] = expr;`、`["id" => $id] = expr;`） |
| `Identifier` + `(` | 表达式语句（函数调用） |
| Internal lowering, no source token | 用于 effectful 复合赋值目标的临时变量支持 lowering 的 `Synthetic` 语句序列 |
