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
