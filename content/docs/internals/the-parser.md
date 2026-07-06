---
title: "解析器"
description: "Token 如何通过 Pratt 解析变成 AST。"
sidebar:
  order: 4
---

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

### 语句（`Stmt`）

会执行动作的东西：

每个 `Stmt` 还携带一个 source `span` 和一个 `attributes` 列表。该列表只会为可合法附加 PHP attributes 的声明语句填充；出现在非声明语句前的 attributes 会在解析阶段被拒绝。

| 变体 | 示例 |
|---|---|
| `Echo(Expr)` | `echo $x;`；多参数 `echo $a, $b;` 会降为一段由 `Echo` 语句组成的 `Synthetic` 序列 |
| `Assign { name, value }` | `$x = 42;` |
| `RefAssign { target, source }` | `$y =& $x;` — 引用别名，其中 target 和 source 都是普通变量 |
| `If { condition, then_body, elseif_clauses, else_body }` | `if (...) { } elseif (...) { } else { }` |
| `While { condition, body }` | `while (...) { }` |
| `DoWhile { body, condition }` | `do { } while (...);` |
| `For { init, condition, update, body }` | `for (...; ...; ...) { }` — `init`、`condition` 和 `update` 都是可选的，因此 `for (;;) { }` 合法 |
| `Foreach { array, key_var, value_var, value_by_ref, body }` | `foreach ($arr as $v) { }`、`foreach ($arr as $k => $v) { }` 或 `foreach ($arr as &$v) { }` |
| `Switch { subject, cases, default }` | `switch ($x) { case 1: ...; default: ... }` |
| `ArrayAssign { array, index, value }` | `$arr[0] = 5;` |
| `NestedArrayAssign { target, value }` | `$arr[0][1] = 5;`、`$obj->items[0] = 5;` |
| `ArrayPush { array, value }` | `$arr[] = 5;` |
| `TypedAssign { type_expr, name, value }` | `int $x = 42;`、`buffer<int> $xs = buffer_new<int>(8);` |
| `FunctionDecl { name, params, variadic, return_type, body }` | `function foo(int $a, &$b, string $c = "x"): string { }` — `params` 是 `Vec<(String, Option<TypeExpr>, Option<Expr>, bool)>`，其中 tuple 存储名称、声明类型、默认值和 `is_ref`（按引用传递）。`variadic` 是可变参数（`...$args`）的 `Option<String>`，`return_type` 是可选的声明 `TypeExpr` |
| `FunctionVariantGroup { name, variants }` | include 加载的隐藏函数实现背后一组公用名称的内部 resolver 元数据 |
| `FunctionVariantMark { name, variant }` | 内部 include body 标记，用于激活在该运行时 include 点加载的隐藏函数 variant |
| `Return(Option<Expr>)` | `return $x;` 或 `return;` |
| `Break(usize)` | `break;`、`break 2;` |
| `Continue(usize)` | `continue;`、`continue 2;` |
| `Include { path, once, required }` | `include 'file.php';` |
| `IncludeOnceMark { label }` | 常规 `include` / `require` 的内部 resolver lowering，用来把已解析文件标记为已加载，供后续 `*_once` guard 使用 |
| `IncludeOnceGuard { label, body }` | `include_once` / `require_once` 的内部 resolver lowering；codegen 会在发出受保护 body 前检查每文件 flag |
| `Throw(Expr)` | `throw new Exception("boom");` |
| `Synthetic(Vec<Stmt>)` | 仅用于内部 lowering；表示在最终 codegen 前已经展开为一个或多个普通语句的源码结构 |
| `Try { try_body, catches, finally_body }` | `try { ... } catch (Exception $e) { ... } finally { ... }` |
| `ConstDecl { name, value }` | `const MAX = 100;` |
| `IfDef { symbol, then_body, else_body }` | `ifdef DEBUG { ... } else { ... }` |
| `NamespaceDecl { name: Option<Name> }` | `namespace App\Core;`、`namespace;` |
| `NamespaceBlock { name: Option<Name>, body }` | `namespace App\Core { ... }`、`namespace { ... }` |
| `UseDecl { imports }` | `use App\Lib\Tool;`、`use function App\fn as helper;`、`use Vendor\Pkg\{Thing, Other as Alias};` |
| `ListUnpack { vars, value }` | `[$a, $b] = [1, 2];`，用于简单的本地位置解构；跳过、带 key、嵌套和非本地解构 pattern 会降为 `Synthetic` 赋值语句 |
| `Global { vars }` | `global $x, $y;` — 声明变量引用全局存储 |
| `StaticVar { name, init }` | `static $count = 0;` — 声明一个跨函数调用持续存在的变量 |
| `ClassDecl { name, extends, implements, is_abstract, is_final, is_readonly_class, trait_uses, properties, constants, methods }` | `final readonly class Point extends Shape implements Named { use NamedTrait; ... }` |
| `EnumDecl { name, backing_type, cases, implements, methods, constants }` | `enum Status: int { case Ok = 1; case Err = 2; }` |
| `PackedClassDecl { name, fields }` | `packed class Vec2 { public float $x; public float $y; }` |
| `InterfaceDecl { name, extends, properties, methods, constants }` | `interface Named extends Stringable { public string $name { get; } public function name(): string; }` |
| `TraitDecl { name, trait_uses, properties, constants, methods }` | `trait Named { public const KIND = "name"; ... }` |
| `PropertyAssign { object, property, value }` | `$p->x = 10;` |
| `StaticPropertyAssign { receiver, property, value }` | `Counter::$count = 10;`、`self::$count = 10;` |
| `StaticPropertyArrayPush { receiver, property, value }` | `Counter::$items[] = 10;`、`self::$items[] = 10;` |
| `StaticPropertyArrayAssign { receiver, property, index, value }` | `Counter::$items[0] = 10;`、`self::$items[0] = 10;` |
| `PropertyArrayPush { object, property, value }` | `$p->items[] = 10;` |
| `PropertyArrayAssign { object, property, index, value }` | `$p->items[0] = 10;` |
| `ExternFunctionDecl { name, params, return_type, library }` | `extern function foo(int $x): int;` 或 `extern "lib" { ... }` 内的条目 — `params` 是 `Vec<ExternParam>`，其中每个 `ExternParam` 存储 `{ name, c_type }`，`return_type` 是 `CType` |
| `ExternClassDecl { name, fields }` | `extern class Point { public int $x; }` |
| `ExternGlobalDecl { name, c_type }` | `extern global ptr $environ;` — 声明类型是面向 C 的 `CType`，不是 `PhpType` |
| `ExprStmt(Expr)` | `my_func();`（作为语句使用的表达式） |

构造函数属性提升会在 class body 解析期间规范化。`__construct` 中像 `public int $id` 这样的参数会变成一个 `ClassProperty`，外加一条等价于 `$this->id = $id;` 的合成前置 `PropertyAssign` 语句。参数默认值保留在构造函数签名上，而不是 `ClassProperty.default`，这与 PHP 对提升参数默认值和属性默认值的区分保持一致。按引用提升的参数会在生成的属性上保留 `by_ref` flag，因此 codegen 能在使用默认值时把属性 slot 绑定到被引用实参或堆引用 cell。后续 pass 只会看到普通属性和普通构造函数赋值。

### 语句分发

在语句层级，解析逻辑分布在 `parser/mod.rs` 和 `stmt/` 子模块之间：

- `mod.rs` 中的 `parse()` 会特判 `extern`，因此一个 `extern "lib" { ... }` 块可以展开为多个 AST 语句。
- 其他所有内容都流经 `stmt::parse_stmt()`，后者根据当前 token 选择解析入口点。

| 当前 token | 解析为 |
|---|---|
| `Class` / `Abstract Class` / `Final Class` / `Readonly Class` / combined class modifiers | 类声明 |
| `Enum` | enum 声明 |
| `Packed` | packed class 声明 |
| `Interface` | interface 声明 |
| `Trait` | trait 声明 |
| `Function` | 函数声明 |
| `Namespace` | namespace 声明 |
| `Use` | namespace import 声明 |
| `Return` | return 语句 |
| `Throw` | throw 语句 |
| `Echo` | echo 语句 |
| `Print` | 包含 `Print(...)` 的通用表达式语句 |
| `If` / `While` / `Do` / `For` / `Foreach` / `Switch` / `Try` | 控制流语句 |
| `Const` / `Global` / `Static` | 声明式语句 |
| `Variable` / `This` / `Identifier` / `Backslash` / `Self_` / `Parent` / `Static::...` | 赋值、属性写入、调用或通用表达式语句 |

这有意比完整 PHP 语句语法更窄。在当前子集中，表达式语句只能通过上面由 `stmt::parse_stmt()` 处理的 token arm 进入；如果语句以 `match`、`new`、`fn`、字面量、`(` 或一元运算符等 token 开始，除非该结构出现在另一种语句形式内部，否则仍会产生 “unexpected token at statement position” 解析器错误。

## 错误恢复

解析器现在不再遇到第一个语法错误就停止。它会在语句边界和块边界上做保守同步，因此一条格式错误的语句不一定会阻止后续语句被解析和报告。

当前恢复行为有意保持简单：

- 顶层解析在语法错误后可以向前跳到下一个看起来合理的语句边界
- 块解析（`{ ... }`）可以在 `;`、`}` 和 `EOF` 上重新同步
- 解析器仍然优先保证正确性，而不是激进恢复，因此严重畸形的输入仍可能比 IDE 风格解析器产生更少诊断

### 二元运算符（`BinOp`）

```
Add  Sub  Mul  Div  Mod  Pow  Concat
Eq  NotEq  StrictEq  StrictNotEq  Lt  Gt  LtEq  GtEq  Spaceship
And  Or  Xor
BitAnd  BitOr  BitXor  ShiftLeft  ShiftRight
NullCoalesce
```

`instanceof` 表示为 `ExprKind::InstanceOf` 而不是 `BinOp`，因为 PHP 对 RHS 有特殊语法：具名目标（`User`、`self`、`parent`、`static`）会像类名一样解析，而变量/属性/数组目标和括号表达式会动态求值。

### 类型表达式（`TypeExpr`）

解析出的类型注解在 checker 将其解析为 `PhpType` 值之前使用 `TypeExpr`：

```
Int  Float  Bool  Str  Void  Never  Iterable
Ptr(Option<Name>)  Buffer(Box<TypeExpr>)  Named(Name)
Nullable(Box<TypeExpr>)  Union(Vec<TypeExpr>)
```

`Iterable` 表示参数、返回值、属性和带类型局部变量注解中的 PHP `iterable` pseudo-type。可空简写（`?T`）和显式 union（`T|U`）会分别表示，因此 checker 可以拒绝 `?T|U` 这样的无效形式，并规范化被接受的声明。

### 类相关类型

`ClassDecl` 使用若干辅助类型：

| 类型 | 字段 | 描述 |
|---|---|---|
| `Visibility` | `Public`, `Protected`, `Private` | 属性/方法可见性的 enum |
| `Attribute` | `name`, `args`, `span` | 来自 `#[...]` 组的 PHP 8 attribute 条目。解析器会验证名称和可选参数表达式。类、方法、属性名称以及受支持的 literal args 会供给 `class_attribute_names()`、`class_attribute_args()`、`class_get_attributes()` 和受支持的 Reflection `getAttributes()` API；参数反射尚未实现。 |
| `AttributeGroup` | `attributes`, `span` | 一个带方括号的 attribute 组。声明位置可以携带一个或多个组。 |
| `EnumCaseDecl` | `name`, `value`, `span`, `attributes` | backed 或 unit enum case 声明，其声明级 attributes 会保留在 AST 中。 |
| `ClassConst` | `name`, `visibility`, `is_final`, `value`, `span`, `attributes` | class、interface 或 trait 常量声明。 |
| `ClassProperty` | `name`, `visibility`, `type_expr`, `hooks`, `readonly`, `is_final`, `is_static`, `is_abstract`, `by_ref`, `default`, `span`, `attributes` | class、trait 或 interface 内的属性声明，可选地携带已解析属性类型声明、hook contract、static-property 标记、按引用提升标记或声明级 attributes |
| `ClassMethod` | `name`, `visibility`, `is_static`, `is_abstract`, `is_final`, `has_body`, `params`, `variadic`, `return_type`, `body`, `span`, `attributes` | class、trait 或 interface 内的方法声明 |
| `CatchClause` | `exception_types`, `variable`, `body` | 一个 catch arm。`exception_types` 支持单类型和 PHP 风格 multi-catch（`TypeA | TypeB`），`variable` 对 PHP 8 风格 `catch (Exception)` 是可选的 |
| `StaticReceiver` | `Named(Name)`, `Self_`, `Static`, `Parent` | `ClassName::method()`、`self::method()`、`static::method()` 和 `parent::method()` 的左侧 |
| `TraitUse` | `trait_names`, `adaptations`, `span` | class 或 trait body 内的 `use TraitA, TraitB { ... }` 子句 |
| `TraitAdaptation` | `Alias { trait_name: Option<Name>, method, alias: Option<String>, visibility: Option<Visibility> }`, `InsteadOf { trait_name: Option<Name>, method, instead_of: Vec<Name> }` | PHP 风格 trait 冲突解决和别名 |
| `UseItem` / `UseKind` | `kind`, `name`, `alias` | `use`、`use function`、`use const` 和 group-use 声明的 namespace import 条目 |
| `CallableTarget` | `Function(Name)`, `StaticMethod { receiver, method }`, `Method { object, method }` | `foo(...)` 或 `Cls::bar(...)` 等 first-class callable 语法的结构化目标 |

每个 AST 节点都携带一个来自源码的 `Span`（行 + 列），因此后续阶段的错误信息可以指向正确位置。

## Pratt parser

**文件：** `src/parser/expr/`

带运算符的表达式解析是最难的部分。考虑：

```php
1 + 2 * 3 ** 4
```

这应该解析为 `1 + (2 * (3 ** 4))`，因为 `**` 比 `*` 绑定更紧，而 `*` 又比 `+` 绑定更紧。并且 `**` 是右结合的（`2 ** 3 ** 4` = `2 ** (3 ** 4)`），而 `+` 和 `*` 是左结合的。

elephc 使用 **Pratt parser**（也称 top-down operator precedence parser）优雅地处理这一点。核心思想是：每个运算符都有一个**绑定力**，也就是一对数字（left、right），用于决定它抓取操作数的紧密程度。

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

### 赋值解析

当解析器看到 `Variable` 时，会向前查看来决定：

```php
$x = 42;         →  Assign { name: "x", value: IntLiteral(42) }
$x += 5;         →  Assign { name: "x", value: BinaryOp(Add, Variable("x"), IntLiteral(5)) }
$x <<= 1;        →  Assign { name: "x", value: BinaryOp(ShiftLeft, Variable("x"), IntLiteral(1)) }
$x ??= 5;        →  Assign { name: "x", value: NullCoalesce(Variable("x"), IntLiteral(5)) }
$x = true and false; → ExprStmt(BinaryOp(Assignment(Variable("x"), BoolLiteral(true)), And, BoolLiteral(false)))
echo ($x += 1);  →  Echo(Assignment(Variable("x"), BinaryOp(Add, Variable("x"), IntLiteral(1))))
$arr[0] = 5;     →  ArrayAssign { array: "arr", index: IntLiteral(0), value: IntLiteral(5) }
$arr[0] += 5;    →  ArrayAssign { array: "arr", index: IntLiteral(0), value: BinaryOp(Add, ArrayGet(...), IntLiteral(5)) }
$arr[] = 5;      →  ArrayPush { array: "arr", value: IntLiteral(5) }
$x++;            →  ExprStmt(PostIncrement("x"))
```

复合赋值（`+=`、`-=`、`*=`、`**=`、`/=`、`.=`、`%=`、`&=`、`|=`、`^=`、`<<=`、`>>=`）会脱糖为带二元运算的常规赋值。null coalescing assignment（`??=`）表示为一个带 `NullCoalesce` 值的常规赋值；codegen 会识别这种形状并发出条件存储，因此只有当当前目标值为 `null` 时才会求值右侧。在表达式形式中，类型检查器和优化器会把 `ExprKind::Assignment`、其隐藏 prelude 和条件值临时变量视为可观察的赋值机制，因此赋值不会被折叠掉，也不会被陈旧的常量传播事实隐藏。

复合赋值可以作用于变量、对象属性、static 属性和非 append 数组元素。对于简单目标，解析器会直接降为最终赋值节点。对于 `$obj->items[next_key()] += 1` 这样的 effectful 非本地目标，解析器会发出一个 `StmtKind::Synthetic` 序列，把 receiver 或 index 表达式存入隐藏临时变量，然后使用这些临时变量执行读-改-写。这既保留了 PHP 的单次求值行为，也避免 codegen 复制目标表达式。

### `try` / `catch` / `finally`

`control.rs` 会解析具有如下总体形状的异常处理语句：

```php
try {
    // body
} catch (TypeA | TypeB $e) {
    // handler
} catch (Exception) {
    // optional variable binding omitted
} finally {
    // cleanup
}
```

每个 `catch` 会变成一个 `CatchClause { exception_types, variable, body }`。`exception_types` 始终存储一个 vector，因此单类型 catch 只是一个单元素列表。

## 如何连接

解析器的输出 `Program`（即 `Vec<Stmt>`）会先进入每文件魔术常量 lowering，然后进入 elephc 的 `ifdef` 构建期条件 pass，再进入 [resolver](how-elephc-works.md)，然后进入专用的名称解析 pass 来规范化 namespace-aware 名称，最后进入 [类型检查器](the-type-checker.md)：

```
[(Token, Span), ...] → Parser → Program (Vec<Stmt>) → MagicConstants → Conditional → Resolver → NameResolver → Type Checker
```
