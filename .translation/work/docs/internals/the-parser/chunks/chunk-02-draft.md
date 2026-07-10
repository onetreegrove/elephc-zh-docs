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
| `Const` / `Global` / `Static` | 类声明语句 |
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
