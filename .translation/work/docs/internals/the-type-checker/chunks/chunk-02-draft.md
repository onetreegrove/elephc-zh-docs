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
