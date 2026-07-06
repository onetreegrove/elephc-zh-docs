**源码：** `src/parser/` — `expr/`、`stmt/`、`control.rs`、`attributes.rs`、`ast/`、`mod.rs`

解析器接收来自 [lexer](the-lexer.md) 的 token 流，并构建 **Abstract Syntax Tree**（AST）：一种表示程序含义而不只是文本的树状结构。

## 什么是 AST？

AST 会剥离语法噪声（括号、分号、花括号），并捕获程序的**结构**：

```php
echo 1 + 2 * 3;
```

token 是扁平的：`Echo, Int(1), Plus, Int(2), Star, Int(3), Semicolon`。但 AST 是一棵树：

```
Echo
 └── BinaryOp(Add)
      ├── IntLiteral(1)
      └── BinaryOp(Mul)
           ├── IntLiteral(2)
           └── IntLiteral(3)
```

这棵树编码了 `2 * 3` 先于 `+ 1` 发生这一事实：**运算符优先级**已经固化在结构中。解析器负责把这一点处理正确。

## AST 类型

**文件：** `src/parser/ast/`

AST 有两类主要节点：

### 表达式（`Expr`）

有值的东西：

| 变体 | 示例 | 说明 |
|---|---|---|
| `IntLiteral(i64)` | `42` | |
| `FloatLiteral(f64)` | `3.14` | |
| `StringLiteral(String)` | `"hello"` | 转义已由 lexer 解析 |
| `BoolLiteral(bool)` | `true`, `false` | |
| `Null` | `null` | |
| `Variable(String)` | `$x` | 不含 `$` 的名称 |
| `BinaryOp { left, op, right }` | `$a + $b` | 见下方运算符表 |
| `InstanceOf { value, target }` | `$obj instanceof User`, `$obj instanceof $className` | 类/接口运行时类型检查。`target` 要么是具名类/接口目标，要么是动态目标表达式。 |
| `Negate(Expr)` | `-$x` | 一元负号 |
| `Not(Expr)` | `!$x` | 逻辑 NOT |
| `BitNot(Expr)` | `~$x` | 按位 NOT（取反） |
| `Throw(Expr)` | `throw new Exception("boom")` | throw 表达式节点，既用于语句，也用于 `??` 或三元表达式等表达式位置 |
| `Print(Expr)` | `print $x` | PHP print 表达式。它写出操作数并返回 `1`；语句形式 `print $x;` 表示为 `ExprStmt(Print(...))`。 |
| `NullCoalesce { value, default }` | `$x ?? $y` | 如果 `$x` 非 null 则返回 `$x`，否则返回 `$y` |
| `Pipe { value, callable }` | `$x |> trim(...)`, `$x |> (fn($v) => $v + 1)` | PHP 8.5 管道运算符。它是专用节点而不是 `BinOp`，因此后续 pass 可以保留 callable 目标之前的左侧求值顺序，并发出管道专用诊断。作为目标的箭头函数必须加括号。 |
| `Assignment { target, value, result_target, prelude, conditional_value_temp }` | `$x = 1`, `$arr[$i] ??= "fallback"` | 赋值表达式。复杂目标可以携带 prelude 语句和合成临时变量，使副作用只求值一次，同时赋值表达式仍返回被赋的值。 |
| `PreIncrement(String)` | `++$i` | 返回新值 |
| `PostIncrement(String)` | `$i++` | 返回旧值 |
| `PreDecrement(String)` | `--$i` | |
| `PostDecrement(String)` | `$i--` | |
| `FunctionCall { name, args }` | `strlen($s)`, `Tools\fmt($s)`, `\strlen($s)` | 解析为结构化名称，供后续阶段解析命名空间别名和完全限定名 |
| `Yield { key, value }` | `yield`, `yield $v`, `yield $k => $v` | generator body 内的 yield 表达式。解析器保留可选的 key/value 表达式；后续 checker/codegen 会把外围函数或闭包转成 `Generator` 状态机。 |
| `YieldFrom(Expr)` | `yield from inner()` | 上下文相关的 `yield from` 委托。lexer 将 `from` 保留为标识符，解析器只在紧跟 `yield` 时识别它。 |
| `ArrayLiteral(Vec<Expr>)` | `[1, 2, 3]`, `[...$arr, 4]` | 索引数组；元素可以包含 `Spread` 表达式 |
| `ArrayLiteralAssoc(Vec<(Expr, Expr)>)` | `["a" => 1]` | 关联数组 |
| `Match { subject, arms, default }` | `match($x) { 1, 2 => "low", 3 => "high" }` | match 表达式（返回一个值）。`arms` 是 `Vec<(Vec<Expr>, Expr)>`，因此每个 arm 在 `=>` 前可以有多个逗号分隔的 pattern，`default` 是可选的（`Option<Box<Expr>>`） |
| `ArrayAccess { array, index }` | `$arr[0]`, `$str[-1]` | 同一个 AST 节点用于索引数组、关联数组查找和字符串索引 |
| `Ternary { condition, then_expr, else_expr }` | `$a ? $b : $c` | |
| `ShortTernary { value, default }` | `$a ?: $fallback` | PHP 短三元 / Elvis 形式。codegen 只求值一次 `value`，如果为真则返回它，否则返回 `default`。 |
| `ErrorSuppress(Expr)` | `@file_get_contents("missing.txt")` | PHP 错误控制前缀表达式。codegen 会把操作数包进运行时警告抑制作用域。 |
| `Cast { target, expr }` | `(int)$x` | |
| `Closure { params, variadic, variadic_type, return_type, body, is_arrow, is_static, captures, capture_refs }` | `function(int $x = 1) use ($y, &$z): string { ... }`, `fn(int $x): int => $x * 2`, or `static function(): int { ... }` | 匿名函数 / 箭头函数。`params` 是 `Vec<(String, Option<TypeExpr>, Option<Expr>, bool)>`，即名称、声明类型、默认值、is_ref。`variadic` 是可选参数名，`variadic_type` 是其可选声明元素类型（`int ...$xs`）。`return_type` 存储可选的闭包 / 箭头函数返回 `TypeExpr`。`captures` 存储按值捕获，`capture_refs` 存储 `use (&$var)` 捕获。箭头函数仍表示为 `Closure`，解析时 `is_arrow = true`，且 AST 中不携带显式 `use (...)` 捕获。闭包带有 `static` 关键字前缀时会设置 `is_static`（PHP `static function () {}` / `static fn () => ...`）；类型检查器会拒绝在 static closure 中引用 `$this`。 |
| `NamedArg { name, value }` | `foo(name: "Alice")` | 命名调用参数。解析器保留源码顺序；后续阶段会根据声明的参数列表验证名称，并为 ABI lowering 规范化已知签名调用。 |
| `ClosureCall { var, args }` | `$fn(1, 2)` | 调用存储在变量中的闭包 |
| `ExprCall { callee, args }` | `$arr[0](1, 2)` | 调用表达式结果（例如返回 callable 的数组访问） |
| `Spread(Expr)` | `...$arr` | spread/unpack 运算符：把数组展开成单独的参数或元素 |
| `IncludeValue { path, once, required }` | `$x = require 'f.php';`, `return include $p;` | 表达式位置中使用的 `include`/`require` 的过渡节点。resolver 会将其完全展开（把被包含文件内联进调用方作用域并捕获其顶层 `return`），因此后续阶段不会再看到它。 |
| `ConstRef(Name)` | `MAX_RETRIES`, `Config\PORT`, `\App\Config\PORT` | 对用户定义常量的引用 |
| `NewObject { class_name, args }` | `new Point(1, 2)`, `new App\Model\User()` | 对象实例化 |
| `NewDynamic { name_expr, args }` | `new $cls(1, 2)` | 类名来自运行时字符串表达式的对象实例化。codegen 时通过运行时类表（`__rt_new_by_name`）解析。 |
| `NewScopedObject { receiver, args }` | `new self()`, `new static()`, `new parent()` | 面向 static receiver 的对象实例化。它不同于 `NewObject`（后者携带固定 `Name`），因此 codegen 可以为 `static` 遵循 late static binding。 |
| `NewDynamicObject { class_name, fallback_class, required_parent, args }` | (internal) | 编译器提供的方法使用的合成工厂，用于从运行时 class-string 构造对象，同时约束它属于已知父类。不会由源码语法产生。 |
| `PropertyAccess { object, property }` | `$p->x` | 通过 `->` 访问属性 |
| `DynamicPropertyAccess { object, property }` | `$p->{$name}` | 属性名是表达式的动态属性访问。动态方法调用会被有意拒绝。 |
| `NullsafePropertyAccess { object, property }` | `$p?->x` | 通过 `?->` 进行 nullsafe 属性访问 |
| `NullsafeDynamicPropertyAccess { object, property }` | `$p?->{$name}` | nullsafe 动态属性访问。如果 receiver 为 null，则跳过属性表达式和链条剩余部分。 |
| `StaticPropertyAccess { receiver, property }` | `Point::$count`, `self::$count`, `parent::$count`, `static::$count` | 通过 `::` 访问类作用域属性，其中 `receiver` 是具名类、`Self_`、`Static` 或 `Parent` |
| `MethodCall { object, method, args }` | `$p->move(1, 2)` | 实例方法调用 |
| `NullsafeMethodCall { object, method, args }` | `$p?->move(1, 2)` | nullsafe 实例方法调用；PHP 拒绝 `?->method(...)` 闭包创建，因此 elephc 会为这种形式报告 `Cannot combine nullsafe operator with Closure creation` |
| `StaticMethodCall { receiver, method, args }` | `Point::origin()`, `self::boot()`, `parent::boot()`, `static::boot()` | 通过 `::` 进行 static 风格调用，其中 `receiver` 是具名类、`Self_`、`Static` 或 `Parent` |
| `FirstClassCallable(CallableTarget)` | `strlen(...)`, `Tools\fmt(...)`, `Math::twice(...)` | PHP 风格 first-class callable 语法；目标会以结构形式保留，而不是解析为调用 |
| `This` | `$this` | 方法内部对当前对象的引用 |
| `PtrCast { target_type, expr }` | `ptr_cast<Point>($p)` | 在 `ptr_cast<T>` 后专门解析的指针标签转换 |
| `BufferNew { element_type, len }` | `buffer_new<int>(256)` | 面向连续热路径 buffer 的编译器扩展 |
| `MagicConstant(MagicConstant)` | `__DIR__`, `__CLASS__` | 从大小写不敏感的魔术常量 token 解析而来。`__LINE__` 会立即降为 `IntLiteral`；其余魔术常量在类型检查前由 `src/magic_constants.rs` lowering。 |
| `ClassConstant { receiver }` | `MyClass::class`, `\App\C::class`, `self::class`, `parent::class`, `static::class` | PHP `::class` 反射字面量。codegen 会把它降为携带完全限定类名的字符串字面量。`static::class` 遵循 late static binding。 |
| `ScopedConstantAccess { receiver, name }` | `MyClass::LIMIT`, `self::DEFAULT_SIZE` | 通过 `::` 访问用户声明的类常量；后续阶段会解析 receiver 和常量元数据。 |
