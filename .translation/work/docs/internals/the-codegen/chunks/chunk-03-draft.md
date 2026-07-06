### 常量引用

```php
const MAX = 100;
echo MAX;
```

使用 `const` 或 `define()` 声明的常量会在编译期解析。当 codegen 遇到 `ConstRef` 时，它会查找常量值并将其作为字面量生成：整数会生成 `mov x0, #100`，字符串则会从 data section 加载字符串标签。`define()` 调用点仍会生成每个常量的运行时 seen flag，使调用仅在第一次运行时定义时返回 `true`，重复尝试时返回 `false` 并产生可抑制的 warning。

Enum case 复用同一思路，但通过 enum 元数据而不是标量常量实现：parser 输出会对 `Color::Red` 使用 `ExprKind::ScopedConstantAccess`，codegen 会检测 enum receiver，并加载 runtime data 中生成的规范 enum-case 符号。`Enum::from()` / `Enum::tryFrom()` 等 helper builtins 会通过 `Context` 中携带的 checker/codegen enum table 进行 lowering；缺失的 `Enum::from()` 值会构造一个可 catch 的 `ValueError`，并带有兼容 PHP 的 backing-value 消息。

### 指针值和强制转换

指针表达式以普通 64 位地址形式保存在 `x0` 中：

- `ptr($var)` 计算一个栈 slot 或全局 slot 的地址，并在 `x0` 中返回
- `ptr_null()` 加载零地址
- `ptr_cast<T>($p)` 只改变 checker 看到的静态类型 tag，因此 codegen 会生成内部表达式并保持地址不变
- 指针打印通过 `__rt_ptoa`，它会在写出之前把地址格式化为 `0x...` 字符串

### Buffer 分配和 packed 热路径访问

`buffer_new<T>(len)` 会直接从 `ExprKind::BufferNew` 降低：codegen 求值元素数量，从类型元数据加载已检查的元素 stride，并调用 `__rt_buffer_new`。`x0` 中得到的指针引用的是连续的 `[length][stride][payload...]` 块，而不是 PHP array/hash 结构。

当 `T` 是标量 POD 类型时，读写会使用从 buffer base 加上 `index * stride` 的直接地址计算。当 `T` 是 `packed class` 时，codegen 会把 buffer 元素 stride 与 `packed_classes` 元数据中的字段偏移结合起来，并对 packed payload 生成直接的带类型 loads/stores。

### 函数调用

```php
my_func($a, $b, $c)
```

1. 求值每个参数，并把结果 push 到栈上
2. 把参数 pop 到正确的 ABI 寄存器（整数为 `x0`-`x7`，浮点数为 `d0`-`d7`，字符串每个占两个寄存器）
3. 如果某个堆支持参数是从现有 owner 借用的（例如局部变量或容器读取），则在传给 callee 前 retain 它
4. `bl _fn_my_func` — branch with link（保存返回地址）
5. 结果根据返回类型位于 `x0`/`d0`/`x1`+`x2`

命名参数调用会拆分求值顺序和 ABI 顺序。`src/codegen/expr/calls/args.rs` 按源码从左到右求值参数，把任何乱序值存入临时 slot，在后续命名表达式运行后验证 spread prefix，然后按 ABI 顺序物化最终参数列表。命名参数之前的 spread prefix 只会求值一次；多个 prefix spread 会先合并，再执行运行时长度/覆盖检查；针对必需参数的过短位置 spread 会失败，而不是越过数组 payload 读取。运行时关联数组 spread 是动态命名 provider：它们按参数名查找字符串 key，为位置 slot 回退到数值 key，并让每个参数的 missing/default 分支决定是否存在必需值。Built-in 和 extern 命名调用会在其规范化位置 emitter 运行前使用相同的源码顺序预求值步骤；可变 built-in 会把目标参数标记为 ref-like，使预求值不会把写入重定向到临时值。Extern 调用先保留 PHP 源码求值顺序，然后才加载 C ABI 寄存器。

## 闭包代码生成

### 匿名函数和箭头函数

闭包（`function($x) { ... }`）和箭头函数（`fn($x) => ...`）会被编译为独立的带标签函数，类似用户定义函数。关键区别是**延迟生成**：闭包主体不会内联生成。具体流程如下：

1. **在闭包表达式位置**：codegen 生成唯一入口标签（例如 `_closure_1`），在 `.data` 中创建静态 callable descriptor，并把 descriptor 地址加载到 `x0`。该 descriptor 包含签名/default/by-reference/variadic 元数据、捕获与隐藏参数绑定、调用形态等 side record。然后 descriptor 指针会作为 `Callable`（8 字节）存入变量的栈 slot。

2. **主体会被延迟**：闭包的参数列表、主体语句、捕获变量和标签会被 push 到 `ctx.deferred_closures`。这避免了在当前函数的指令流中间生成函数代码。

3. **在 `_main` 之后**：所有延迟闭包都会像用户定义函数一样，作为独立带标签函数生成（prologue、body、epilogue）。

### `use` 捕获

闭包可以通过 `use ($var1, $var2)` 从外层作用域捕获变量：

```php
$greeting = "Hello";
$fn = function($name) use ($greeting) {
    echo $greeting . " " . $name;
};
```

只有显式 `use (...)` 捕获会存储在 AST 中，并作为隐藏闭包参数转发。箭头函数仍被解析为闭包，但它们使用 `is_arrow = true` 且 `captures` 列表为空。

AST 会把捕获的变量名存入 `Closure` 表达式的 `captures` 字段。在调用点，捕获变量会作为**额外参数**在显式参数之后传递：

1. **在闭包表达式位置**：捕获变量名和类型会与延迟闭包一起记录在 `ctx.closure_captures` 中。
2. **在调用点**（`$fn("World")`）：codegen 查找捕获变量，从调用方作用域求值它们，并在显式参数之后作为额外参数传递。
3. **在闭包主体中**：捕获值作为额外参数进入，并存入局部栈 slot，使其可像普通局部变量一样访问。

这意味着捕获是**按值**传递的：在闭包内修改捕获变量不会影响外层作用域（符合 PHP 语义）。

### 闭包调用

当闭包变量被调用（`$fn(1, 2)`）时，codegen 会：

1. 求值每个参数，并把结果 push 到栈上
2. 从变量的栈 slot 把闭包 descriptor 加载到 `x9`
3. 从 descriptor 的 entry slot 加载原生入口地址
4. 在把参数 pop 到 ABI 寄存器时临时 push `x9`
5. pop 回 `x9` 并调用 `blr x9` — 通过寄存器进行间接分支

`blr`（Branch with Link to Register）类似 `bl`，但目标地址来自寄存器而不是标签。正是它让闭包可以工作：编译器在编译期并不知道会调用哪个函数，因此使用间接跳转。
