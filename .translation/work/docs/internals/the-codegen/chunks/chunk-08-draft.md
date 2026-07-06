### Variadic 参数和 spread operator

```php
function sum(...$nums) { /* $nums is an array */ }
sum(1, 2, 3);
sum(...$arr);  // spread
```

**Variadic 函数**：最后一个参数可以带有 `...` 前缀，用于把所有剩余参数收集到一个数组中。在调用点，codegen 会：

1. 通过寄存器正常传递常规（非 variadic）参数
2. 使用 `src/codegen/expr/calls/args.rs` 中的共享 helper 准备 normalized/defaulted 参数列表，降低 pass-by-reference slot，处理 spread-into-named 参数，并在需要时构建尾部 variadic 数组
3. 把数组指针作为最后一个参数寄存器传递

**Spread operator**（`...$arr`）：用 `...$arr` 调用函数时，数组会被解包为位置参数。对于 `function f($a, ...$rest)`，`f(...[1, 2, 3])` 会把 `1` 传给 `$a`，并把 `[2, 3]` 收集到 `$rest`。关联数组 spread 会把字符串 key 映射到命名参数，保留数值 key 作为位置参数，并在规划前把重复的静态字符串 key 折叠为最后一个值。命名参数之前的变量 `AssocArray` spread 可以在运行时通过字符串 key 满足后续参数，因此 codegen 会跳过该动态 provider 的固定 prefix 长度检查，改为生成每参数 lookup/default 处理。在数组字面量中，spread operator 使用 `__rt_array_merge_into` 把 spread 数组中的所有元素追加到目标数组。

### 默认参数值

函数和闭包支持默认参数值：

```php
function greet($name, $greeting = "Hello") { ... }
```

当调用点省略具有默认值的参数时，codegen 会填入默认值。在调用点，编译器检查实际传入了多少参数，并对每个缺失且带默认值的参数求值默认表达式，将其放入适当的参数寄存器。这在编译期处理，不需要运行时检查。

### `collect_local_vars()`

在函数主体 AST 上预扫描，找出将要使用的每个变量。这是必要的，因为栈空间必须在 prologue 中、任何代码运行之前分配。

它会在代码生成前遍历语句树，并递归处理主要的局部绑定形式（`Assign`、控制流块、`For`/`Foreach`、`ListUnpack`、`Global`、`StaticVar` 和相关情况）。确切匹配由 `functions/` 模块中的实现驱动，因此此列表是示意性的，并非穷尽。

## 主程序代码生成

**文件：**`src/codegen/mod.rs`

`generate()` 函数编排所有内容：

1. **生成用户函数** — 扫描 AST 中的 `FunctionDecl`，并生成每个函数
2. **生成类方法** — 构造器、实例方法和静态方法使用各自的标签
3. **生成 `_main`**：
   - Prologue（全局变量的栈 frame）
   - 保存来自 OS 的 `argc` 和 `argv`（它们位于 `x0` 和 `x1`）
   - 通过 `__rt_build_argv` 运行时调用构建 `$argv` 数组
   - 注册 main activation record，使异常也能通过顶层代码展开
   - 生成所有非函数语句
   - Epilogue：清理 owned locals，注销 activation record，然后 `exit(0)`
4. **生成延迟闭包** — 早期表达式 codegen 期间记录的闭包主体
5. **生成运行时例程** — 所有 `__rt_*` helper 函数
6. **生成 data section** — 字符串和浮点字面量
7. **生成 runtime data / BSS** — 全局 buffer、globals、statics 和 lookup table

Linux x86_64 使用与 AArch64 目标相同的共享运行时生成表面。数组变换、排序 helper、copy-on-write 路径、GC 计数、堆 debug helper、字符串搜索/格式化 helper、内联数组/字符串 accessor 和 list unpacking 都通过 target-aware emitter 和 ABI 模块路由，而不是单独的缩减运行时切片。

当某个操作需要架构特定汇编时，叶子运行时模块会在内部选择原生序列。例如，x86_64 helper 会在需要时使用 SysV 寄存器、RIP-relative 寻址和 x86_64 堆标记，而 AArch64 helper 会使用自己的寄存器和重定位约定。更高层 lowering 应继续调用共享运行时标签和 ABI helper，而不是基于原始 ARM64 或 x86_64 细节分支。
