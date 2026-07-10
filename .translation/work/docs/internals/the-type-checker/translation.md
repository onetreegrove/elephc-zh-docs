---
title: "类型检查器"
description: "elephc 如何在编译期推断并验证类型。"
sidebar:
  order: 5
---

**源码：** `src/types/` — `mod.rs`、`model.rs`、`traits.rs`、`checker/mod.rs`、`checker/driver/`、`checker/builtin_interfaces.rs`、`checker/builtin_iterators.rs`、`checker/builtin_json.rs`、`checker/builtin_spl_exceptions.rs`、`checker/builtin_stdclass.rs`、`checker/builtin_types/`、`checker/builtins/`、`checker/functions.rs`、`checker/functions/`、`checker/inference/`、`checker/stmt_check.rs`、`checker/stmt_check/`、`checker/type_compat.rs`、`checker/type_compat/`、`checker/schema/`、`checker/yield_validation/`、`warnings/`

PHP 是动态类型语言：变量可以在运行时改变类型。但 elephc 会编译为原生代码，而每个值都必须有已知的大小和位置。类型检查器通过**在编译期推断类型**来弥合这个差距。

## 为什么类型检查重要

[code generator](the-codegen.md) 需要知道类型，才能发出正确的汇编：

- `Int` 位于寄存器 `x0`（8 字节）
- `Float` 位于寄存器 `d0`（8 字节）
- `String` 位于 `x1`（指针）+ `x2`（长度）= 16 字节

如果 code generator 不知道 `$x` 是整数还是字符串，它就不知道该使用哪些寄存器、在栈上分配多少字节，或者发出哪条比较指令（整数用 `cmp`，浮点数用 `fcmp`）。

## 类型系统

**文件：** `src/types/model.rs`

elephc 有一个小型类型系统：

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

这仍远小于完整 PHP 的运行时类型系统，但现在已经包含语言子集支持范围内的用户编写 union 和 nullable 注解。`Union(...)` 值会降为与 `Mixed` 相同的 boxed 运行时表示。`TaggedScalar` 从不由 checker 本身产生：codegen funnel 会在 tagged null 表示（默认；见 `--null-repr`）下从 `int|null` union 构造它，把值存储为内联双字 `{payload, tag}` pair，而不是堆上的 boxed cell。`Array`（索引）和 `AssocArray`（key-value）的区别会在编译期由字面量语法决定（`[1, 2]` vs `["a" => 1]`），任一表示中的异构 payload 都会拓宽为 boxed `Mixed` 元素。

`Never` 是只用于返回位置的标记：注解为 `: never` 的函数必须始终发散（throw、调用 `exit()`/`die()` 或无限循环）。类型检查器会拒绝这类函数中任何可达的 `return value;`，运行时大小为零，因为值永远不会实体化。`: never` 作为参数或局部变量类型会被拒绝，这与 `: void` 的限制相同。

`Iterable` 表示 PHP 的 `iterable` pseudo-type（`array | Traversable`）。运行时它被视为类型擦除的 8 字节原始堆指针：checker 接受声明为 `iterable` 的参数接收 `Array`、`AssocArray`、`Iterator` 对象和 `IteratorAggregate` 对象；对 `iterable` 局部变量执行 `foreach` 时，`$key` 和 `$value` 都会被类型化为 `Mixed`。对 iterable 值的直接操作（`foreach`、`echo`、`gettype()`、`var_dump()`、`===`、标量 cast、`is_iterable()`）会通过 `__rt_heap_kind` 运行时 helper 分发。索引数组 iterable 使用数组 header 中存储的 value-type tag 将循环值 box 为 `Mixed`；关联 iterable 复用 hash iterator payload tag；对象支持的 iterable 会经由 interface 元数据分支，然后使用 `Iterator` 方法分发路径。

`Callable` 用于匿名函数（闭包）、箭头函数和 first-class callables。闭包和 first-class callable 值存储为一个 8 字节 descriptor 指针。descriptor 携带 callable kind、native entry ABI slot、可选 PHP 可见名称、signature/environment/invocation 元数据，以及可选的生成 invoker slot。动态调用 builtins 会复用这些元数据和生成的 wrapper cases，来调用运行时选择的用户函数、受支持的 builtin string callbacks、public static-method strings、callable arrays 和 invokable objects。

`Object(String)` 表示类实例。字符串携带名称解析后的规范类名（例如 `"Point"` 或 `"App\\Point"`）。对象是堆分配指针（栈上 8 字节）。

`Pointer(Option<String>)` 表示原始 64 位地址。`Pointer(None)` 是不透明指针，而 `Pointer(Some("Point"))` 是带已检查 pointee 类型标签的指针。标签影响静态检查，但运行时值仍只是 `x0` 中的一个地址。

`Resource(Option<String>)` 表示 PHP resource handles。`Resource(None)` 是泛型 resource，而 `Resource(Some("stream"))` 是成功 `fopen()` 调用以及 `STDIN` / `STDOUT` / `STDERR` 常量使用的 stream-handle 形状。resource 值在 codegen 中存储为一个 8 字节 native payload，但类型检查器会把它们与整数区分开，使 stream built-ins 可以拒绝普通数字 descriptor。

## 推断如何工作

类型检查器自顶向下遍历 AST，维护一个**类型环境**：`HashMap<String, PhpType>`，用于把变量名映射到其类型。它还跟踪一个**常量映射**：`HashMap<String, PhpType>`，记录每个用户定义常量（通过 `const` 或 `define()` 声明）的类型。

### 赋值创建类型

```php
$x = 42;          // $x: Int (inferred from the literal)
$name = "Alice";   // $name: Str
$pi = 3.14;       // $pi: Float
$ok = true;       // $ok: Bool
$nothing = null;   // $nothing: Void
```

第一次赋值会决定变量类型。之后，重新赋值只允许使用相同类型（存在一些例外）：

### 类型兼容规则

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

这意味着 elephc 会拒绝 PHP 原本允许的代码：

```php
$x = 42;
$x = "hello";  // ← Type error: cannot reassign $x from Int to Str
```

这是有意为之：它让编译器无需运行时类型标签，就能准确知道每个位置上的 `$x` 是什么。

## 语句检查

语句检查会验证不属于表达式类型的控制流约束。`foreach` 接受索引数组、关联数组、类型为 `Iterable` 的值，以及实现 `Iterator` 或 `IteratorAggregate` 的对象/接口。索引数组和关联数组循环会把 key/value 变量绑定到推断出的 element/key 类型；`Iterable` 和对象支持的 iterator 循环会把它们绑定为 `Mixed`，因为具体 payload tag 要到运行时才会发现。`break` 和 `continue` 会跟踪当前活跃的 loop/switch 目标深度，因此只有当当前函数或闭包 body 中存在两个外围 break/continue 目标时，`break 2;` 才会被接受。函数、方法和闭包 body 会重置这个深度，因此内部声明不能跳转到外部循环。`finally` body 也会记录进入时的目标深度：`break` 或 `continue` 可以跳转到该 `finally` 内部创建的 loop/switch，但禁止跳出 `finally` 块，以匹配 PHP。

## 表达式类型推断

类型检查器会计算每个表达式的类型：

### 字面量

| 表达式 | 类型 |
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

### 二元运算

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

### 函数调用

内置函数有硬编码类型签名（见下方）。用户定义函数、方法、构造函数、闭包和箭头函数可以携带声明参数提示；函数、方法、闭包和箭头函数可以携带声明返回类型提示。声明的非 `void` 返回值既会针对返回值检查，也会针对可达的 fallthrough 路径检查，而 `throw`、`exit()`/`die()` 和可证明的无限循环会算作非返回路径。闭包 / 箭头函数返回注解会在 AST 中表示，并穿入 callable `FunctionSig` 元数据；未注解闭包继续从 body 或表达式推断返回类型。命名参数会先根据声明参数列表验证，然后才执行通常的参数数量和类型检查，范围包括 built-ins、extern 调用、带字符串 key 的关联数组 spread，以及填充较早位置 slot 的 spread 前缀。命名参数前面的变量 `AssocArray` spread 会被视为动态命名 provider，因此只有在没有前置关联 spread 可能在运行时提供缺失参数时，才保留 required-parameter 诊断。用户定义 variadic 函数上的未知命名参数会被接受，并作为 variadic 参数的一部分进行类型化；而 builtin variadics 会像 PHP 内部函数一样拒绝未知命名参数。进入 variadic callee 的位置 spread 会先填充常规参数，然后把剩余 tail 类型化为 variadic array。

Codegen 会接收足够的签名信息，从而按 PHP 源码顺序对 named/spread 参数求值，同时仍以 ABI 参数顺序实体化值。


## 内置函数签名

**文件：** `src/types/checker/builtins/`，以及用于 `ExprKind::PtrCast`、`ExprKind::InstanceOf`、`ExprKind::Print` 等特殊表达式形式的 `src/types/checker/mod.rs` 和 `src/types/checker/inference/`

每个内置函数都有注册的类型签名：

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

上表中的大多数条目来自 builtin signature registry，而 `ptr_cast<T>()` 这类指针标签转换会在类型检查器访问 `ExprKind::PtrCast` 时直接检查。`instanceof` 也作为专用表达式检查：它始终返回 `Bool`，会根据当前类上下文验证具名 `self` / `parent` / `static` 目标，检查动态目标表达式是否是普通有效表达式，并且有意允许未知具名目标，让运行时行为可以像 PHP 一样返回 `false`。对于某些 built-ins，checker 还会强制检查 container shape，而不只是原始参数数量：

- `array_push($arr, $val)` 要求第一个参数是索引 `Array`，而不是 `AssocArray`
- `array_column($rows, $column_key)` 要求第一个参数是元素类型为 `AssocArray` 的索引数组
- `wordwrap()` 接受 1 到 4 个参数，与 builtin checker 匹配

类型检查器会验证：

1. **参数数量**：参数过少或过多 → 错误
2. **参数类型**：类型错误 → 错误（在某些情况下；许多 builtins 接受多种类型）
3. **返回类型**：用于推断调用表达式的类型

## 用户定义函数检查

**文件：** `src/types/checker/functions.rs`

当类型检查器遇到函数声明时，它会：

1. **收集所有函数声明**，作为第一遍处理（因此函数可以先调用后定义）
2. **为函数 body 创建局部类型环境**（与全局作用域分离）
3. **解析声明参数类型**（当存在 type hints 时），否则回退到现有 defaults / inference 路径
4. **解析声明返回类型**（当存在时），否则从 `return` 表达式推断
5. **根据声明类型验证默认值、调用点和 return 语句**，包括 PHP 风格默认参数（例如 `int $x = 10`）以及根据声明参数名进行的命名参数重排
6. **存储 `FunctionSig`**：参数数量、参数类型、返回类型、引用参数和 variadic 参数

`FunctionSig` struct：

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

- `ref_params` 跟踪哪些参数使用 `&`（按引用传递）。codegen 传递实参的栈地址，而不是它的值。
- `declared_params` 让后续阶段区分显式 PHP type hints 和推断/默认得到的参数类型。
- `declared_return` 让后续阶段区分显式 PHP return hints 和推断返回类型。
- `variadic` 保存 variadic 参数的名称（例如 `function foo(...$args)` 中的 `$args`）。超出常规参数的额外参数会被收集进一个数组。
- `deprecation` 在存在 PHP 8.4 `#[Deprecated]` 元数据时携带它，使调用点可以一致地暴露警告。

### 未类型化参数的调用点推断

没有 type hint 的参数会从 `Int` fallback 开始，并根据调用点观察到的实际参数类型专门化。checker 会累计每个未声明参数在**所有**调用点看到的参数类型：如果某个参数只用单一类型调用，就采用该类型；如果调用类型不兼容（例如一个调用点是 `int`，另一个是 `string`），则拓宽为 `Union`，使每个参数保持自身运行时表示，而不是被强制转为最后看到的类型。成员全是 `int`/`bool` 的 union 会折叠回 `Int`（保留只含 int 或 bool 调用时的 int fallback），而 `void` 参数永远不会专门化参数。由于 `Union` 会降为与 `Mixed` 相同的 boxed 运行时形状，这类参数会在调用点被 box，并在使用位置 unbox。

同样的累计逻辑适用于实例方法和 static 方法参数。闭包参数会专门化为第一个观察到的参数类型，但不会拓宽为 union，因此用不兼容参数类型调用闭包会被拒绝，而不是被强制转换。

这些信息随后用于检查对该函数的调用。

### 类型收窄（`is_*` / `instanceof` guard）

在由单个变量上的类型谓词保护的 `if` 内，checker 会为被保护分支收窄该变量类型。`is_int`/`is_integer`/`is_long`、`is_float`/`is_double`、`is_string` 和 `is_bool` 会收窄到对应标量；`$x instanceof Class` 会收窄到该类。then 分支看到被保护类型，else 分支看到补集（`Union` 会丢弃匹配成员）；前置 `!` 会交换两者。没有 `else` 且 body 总是发散（`return`/`throw`）的 guard，会把 `if` 后的语句收窄到补集。这使常见的 “overload” 形状能够通过类型检查：

```php
function set($x): void {                 // $x inferred int|Foo from the call sites
    if (is_int($x)) { $this->n = $x; }   // $x is int here -> stored into an int property
    else { $this->o = $x->run(); }       // $x is Foo here -> method dispatched on its class
}
```

收窄纯粹是类型检查器步骤：变量保持其 boxed runtime（`Mixed`）表示，codegen 会在需要收窄类型的位置强制转换它：标量使用时 unbox，在 `Mixed`/union receiver 上按运行时 class id 分发方法。变量在分支内重新赋值后，收窄不会跨赋值进行 flow-sensitive 传播。

## 诊断和警告

checker 不再严格只报告第一个错误。许多 pass 现在会累计独立语义错误，并以分组诊断返回，而不是在第一个失败处立即中止。

成功检查后，elephc 还会在 AST 上运行一个 warning pass。当前 warning 包括：

- 未使用的局部变量和参数
- 不可达代码

Warnings 通过 `CheckResult` 返回，并由 CLI 打印，但不会使编译失败。

## checker 在优化器流水线中的位置

类型检查器位于早期 folding pass 和 `src/optimize/` 中四个 post-check cleanup pass 之间：

- `fold_constants()` 首先运行，简化已经能静态决定的标量表达式。
- `propagate_constants()` 在检查成功后运行，将已知标量局部变量通过保守的直线和 merge 形状向前传播。
- `prune_constant_control_flow()` 只在检查成功和 warning 收集之后运行，因此可以移除 dead branches，而不会抑制本应报告的类型错误或 warning。
- `normalize_control_flow()` 在 pruning 后运行，把结构等价的控制流壳改写为更简单的 AST 形状。
- `eliminate_dead_code()` 在 normalization 后运行，移除剩余不可达或不可观察的语句。

这个顺序是有意设计的。elephc 乐于在检查前把 `2 + 3` 改写成 `5`，但它不希望优化 pass 过早删除坏代码，从而让坏代码看起来合法。

## 全局环境

在检查用户代码之前，类型检查器会用内置 globals 预填充环境：

```rust
global_env.insert("argc", PhpType::Int);
global_env.insert("argv", PhpType::Array(Box::new(PhpType::Str)));
```

它们对应 PHP 的 `$argc` 和 `$argv` superglobals。

## Interface 类型检查

在构建 `ClassInfo` 之前，checker 会通过 `src/types/traits.rs` 展平 trait composition，为每个 interface 构建 `InterfaceInfo` 条目，然后才递归构建 class 元数据。

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

对于每个 interface，checker 会传递性解析 `interface extends interface`，拒绝继承环，把所需方法展平成单一 signature map，并分配稳定的方法顺序供运行时元数据发出使用。`properties` 记录 interface 要求的 PHP 8.4 property hook contracts，`constants` 携带从父 interface 继承来的 interface constants。


## Class 类型检查

interface 已知后，checker 会构建每个 class，使其能够看到 parent-first 属性布局、继承方法签名、abstract/final 约束、已实现 interface contracts 和 vtable slot 分配。

当类型检查器遇到 `ClassDecl` 时，它会：

1. **注册 class** 到 `classes: HashMap<String, ClassInfo>` map 中
2. **解析 parent chain**（`extends`）并合并继承元数据
3. **记录每个实例属性**及其类型（属性类型存在时使用声明类型，否则从默认值或构造函数赋值推断），并在继承对象布局中分配固定 offset
4. **类型检查每个方法 body**，其中 `$this` 绑定到 `Object(ClassName)`
5. **构建 `ClassInfo`**，其中包含实例和 static 属性类型、默认值、visibility maps、final property/method sets、signatures、declaring/implementation class maps、instance/static vtable slots、implemented interface lists，以及 constructor-to-property mappings

`ClassInfo` struct：

```rust
pub struct ClassInfo {
    pub class_id: u64,
    pub parent: Option<String>,
    pub is_abstract: bool,
    pub is_final: bool,
    pub is_readonly_class: bool,
    pub allow_dynamic_properties: bool, // #[\AllowDynamicProperties] (PHP 8.2)
    pub constants: HashMap<String, Expr>, // user-declared class constants
    pub attribute_names: Vec<String>,
    pub attribute_args: Vec<Option<Vec<AttrArgValue>>>,
    pub method_attribute_names: HashMap<String, Vec<String>>,
    pub method_attribute_args: HashMap<String, Vec<Option<Vec<AttrArgValue>>>>,
    pub property_attribute_names: HashMap<String, Vec<String>>,
    pub property_attribute_args: HashMap<String, Vec<Option<Vec<AttrArgValue>>>>,
    pub used_traits: Vec<String>,
    pub properties: Vec<(String, PhpType)>,
    pub property_offsets: HashMap<String, usize>,
    pub property_declaring_classes: HashMap<String, String>,
    pub defaults: Vec<Option<Expr>>,
    pub property_visibilities: HashMap<String, Visibility>,
    pub declared_properties: HashSet<String>,
    pub final_properties: HashSet<String>,
    pub readonly_properties: HashSet<String>,
    pub reference_properties: HashSet<String>,
    pub abstract_properties: HashSet<String>,
    pub abstract_property_hooks: HashMap<String, PropertyHookContract>,
    pub static_properties: Vec<(String, PhpType)>,
    pub static_defaults: Vec<Option<Expr>>,
    pub static_property_declaring_classes: HashMap<String, String>,
    pub static_property_visibilities: HashMap<String, Visibility>,
    pub declared_static_properties: HashSet<String>,
    pub final_static_properties: HashSet<String>,
    pub method_decls: Vec<ClassMethod>,
    pub methods: HashMap<String, FunctionSig>,
    pub static_methods: HashMap<String, FunctionSig>,
    pub callable_method_return_sigs: HashMap<String, FunctionSig>,
    pub callable_array_method_return_sigs: HashMap<String, FunctionSig>,
    pub method_visibilities: HashMap<String, Visibility>,
    pub final_methods: HashSet<String>,
    pub method_declaring_classes: HashMap<String, String>,
    pub method_impl_classes: HashMap<String, String>,
    pub vtable_methods: Vec<String>,
    pub vtable_slots: HashMap<String, usize>,
    pub static_method_visibilities: HashMap<String, Visibility>,
    pub final_static_methods: HashSet<String>,
    pub static_method_declaring_classes: HashMap<String, String>,
    pub static_method_impl_classes: HashMap<String, String>,
    pub static_vtable_methods: Vec<String>,
    pub static_vtable_slots: HashMap<String, usize>,
    pub interfaces: Vec<String>,
    pub constructor_param_to_prop: Vec<Option<String>>,
}
```

`vtable_methods` / `vtable_slots` 驱动普通继承实例分发，而 `static_vtable_methods` / `static_vtable_slots` 携带并行元数据，用于 `static::method()` late static binding。`allow_dynamic_properties` 记录 PHP 8.2 `#[\AllowDynamicProperties]` attribute，因此 codegen 可以把未声明属性存储路由到每对象 side table。`*_attribute_names` / `*_attribute_args` 字段携带 class 及其方法和属性的 PHP 8 attribute 元数据，使 Reflection codegen 路径可以实体化 `ReflectionAttribute` 对象。`abstract_property_hooks` 记录具体子类必须满足的 PHP 8.4 property hook contracts。

对于 abstract methods，checker 会保留继承签名，但有意把 implementation-class 条目留空，直到具体子类提供 body。如果 inheritance + trait flattening + interface conformance checks 后仍有任何 abstract 或 interface requirement 未解决，具体 class 会被拒绝。

检查属性访问（`$obj->prop`）时，类型检查器会验证：

- 变量是 `Object` 类型
- class 拥有该名称的属性
- 属性可访问（`public`、来自声明 class 或子类的 `protected`，或只来自声明 class 的 `private`）

Nullsafe access（`$obj?->prop`、`$obj?->method()`）接受对象和 nullable-object receiver。如果静态 receiver 类型恰好是 `null`，表达式类型就是 `null`，不会验证被跳过的成员。如果 receiver 是 `T|null`，checker 会针对 `T` 验证成员，并把结果拓宽为包含 `null`。

当 nullable union 解析为一个具体 class 时，普通成员访问也会被接受。这使 `$obj?->profile->address` 这样的混合链可以类型化：较早 nullsafe segment 引入的 null 会保留在推断结果中，而 codegen 决定后续普通 `->` 是由共享 nullsafe branch 跳过，还是接收真实 null 并像 PHP 一样 warning/fatal。

检查 static 属性访问（`ClassName::$prop`、`self::$prop`、`parent::$prop` 或 `static::$prop`）时，checker 会把 receiver 解析到 class scope，验证 static 属性存在，根据 declaring class 应用可见性规则，并在赋值时强制声明属性类型。static 属性存储以有效 declaring class 为 key：继承的 static 属性共享 parent slot，直到子类重新声明该属性，此时子类会获得自己的 slot。非 private 重声明必须保持声明类型 invariant，不能降低可见性，不能覆盖 `final`；private 重声明相互独立。codegen 会处理 late-bound `static::$prop` 分发，并在被调用 class 解析到当前方法作用域外的 private 重声明 slot 时报告运行时 fatal error。

检查属性写入时，显式声明的属性类型保持固定。默认值、直接赋值、数组写入以及经由未类型化参数路由的构造函数赋值，都必须与声明属性类型兼容。Nullable 和 union 属性类型使用与 typed locals 相同的 boxed mixed 运行时表示，而未类型化属性保留现有推断和 refinement 行为。

构造函数提升属性到达 checker 时，已经是普通 class properties 加上解析器生成的合成构造函数赋值。这使提升参数 type hints、默认值、可见性、readonly 检查和按引用参数验证可以复用与手写构造函数赋值相同的 `FunctionSig`、属性元数据和 constructor-to-property mapping。checker 会在 `reference_properties` 中记录按引用提升的属性，codegen 用它来存储 alias pointer，而不是 owned property value。

PHP 8.4 property hook contracts 在 class 元数据上表示为 abstract property requirements。Interface properties 和 abstract trait/class properties 会分别记录 get 和 set 类型义务：get contracts 是协变的，set contracts 是逆变的，get+set contracts 对普通属性实际上是 invariant。具体 class 在重新声明兼容实例属性时，会清除这些 abstract requirements。

检查方法调用时，它会验证方法存在，强制方法可见性（`public`、子类可见的 `protected`、仅 declaring-class 可见的 `private`），根据方法的 `FunctionSig` 验证参数数量和类型，把 `parent::method()` 解析到直接父类，把 `self::method()` 解析到当前 lexical class，并接受 `static::method()` 作为针对当前 class hierarchy 的 late-static-bound static call。First-class callable 验证会为 `static::method(...)` 和 `$obj->method(...)` 这样的稳定对象 receiver 目标使用相同方法元数据。

检查 `new ClassName(...)` 时，它还会在 codegen 前拒绝 interface 和 abstract class。

### 内置 coroutine 和 iterator class

`Throwable`、`Error`、`Exception`、`Fiber` 和 `FiberError` 会在检查用户代码前注册为内置 class-like 类型。`FiberError` extends `Error`，与 PHP throwable hierarchy 匹配。`Fiber` 方法 body 是 `ClassInfo` 中的占位符：其签名使调用可通过类型检查，而 codegen 会拦截构造、实例方法、`Fiber::suspend()` 和 `Fiber::getCurrent()`，并把它们路由到 `__rt_fiber_*` helpers。

`src/types/fibers.rs` 负责 Fiber callbacks 的额外静态检查。`new Fiber(...)` 接受闭包、已知 callable 变量、first-class callables、运行时字符串 callbacks、static-method callable arrays、存储的或字面量实例方法 callable arrays（例如 `[$object, "method"]`）、运行时选择的 callable arrays（例如 `[$object, $method]`），以及 invokable-object 表达式（例如 `new Job()`）。literal string callbacks 会尽可能解析到 user-function、builtin、extern 或 public static-method signatures；动态字符串变量会把 descriptor selection 延迟到 codegen。存储的实例方法 callable-array 变量会通过同一 first-class callable signature 路径检查，而 codegen 会从数组 slot 自身绑定 receiver。可见 callback 参数数量上限为七个 start arguments；当签名静态已知时，按引用 callback start 参数会被拒绝。闭包捕获和 receiver environments 位于 callable descriptor capture slots，而不是 Fiber 的可见 start-argument 区域。通过 `start()`、`resume()`、`suspend()` 和 `getReturn()` 移动的值都会类型化为 boxed `mixed`。

`Iterator`、`IteratorAggregate` 和 final 内置 `Generator` class 由 `src/types/checker/builtin_iterators.rs` 注入。`Generator` implements `Iterator`，并为 `current`、`key`、`next`、`valid`、`rewind`、`send`、`throw` 和 `getReturn` 携带占位方法 body；codegen 会拦截这些方法并路由到 `__rt_gen_*` helpers。`yield_validation` 会把任何包含 `yield` 的函数或闭包 body 标记为返回 `Object("Generator")`，同时仍允许与 `Generator`、`Iterator`、`Traversable` 或 `iterable` 兼容的声明返回类型。

## 输出：CheckResult

类型检查器会产生一个 `CheckResult`：

```rust
pub struct CheckResult {
    pub global_env: TypeEnv,                    // variable name → type
    pub functions: HashMap<String, FunctionSig>, // function name → signature
    pub callable_param_sigs: HashMap<(String, String), FunctionSig>, // (function, param) → callable signature
    pub callable_return_sigs: HashMap<String, FunctionSig>, // function → returned callable signature
    pub callable_array_return_sigs: HashMap<String, FunctionSig>, // function → returned callable-array element signature
    pub interfaces: HashMap<String, InterfaceInfo>, // interface name → interface info
    pub classes: HashMap<String, ClassInfo>,     // class name → class info
    pub enums: HashMap<String, EnumInfo>,
    pub packed_classes: HashMap<String, PackedClassInfo>,
    pub extern_functions: HashMap<String, ExternFunctionSig>,
    pub extern_classes: HashMap<String, ExternClassInfo>,
    pub extern_globals: HashMap<String, PhpType>,
    pub required_libraries: Vec<String>,
    pub warnings: Vec<CompileWarning>,
}
```

它会传递给 [code generator](the-codegen.md)，后者用它来：

- 为每个变量分配正确数量的栈空间
- 选择正确的寄存器和指令
- 发出恰当的类型强制转换
- 把 FFI 声明和 linker requirements 带入 codegen

## 错误示例

```php
$x = 42;
$x = "hello";
// Error: Type error: cannot reassign $x from Int to Str

strlen(42);
// Error: strlen() expects string, got Int

unknown_func();
// Error: Undefined function: unknown_func

substr("hello");
// Error: substr() takes 2 or 3 arguments
```

每个错误都包含精确的行和列，这要归功于从 [lexer](the-lexer.md) 一路携带过来的 `Span`。
