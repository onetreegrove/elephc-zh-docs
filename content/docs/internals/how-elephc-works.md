---
title: "编译流水线"
description: "从 PHP 源码到可运行二进制文件的完整旅程。"
sidebar:
  order: 2
---

本页通过一个具体示例，逐步讲解从 PHP 源码到可运行的原生二进制文件（native binary）的完整编译过程。

## 示例

```php
<?php
$x = 10;
if ($x > 5) {
    echo "big\n";
}
```

让我们跟随这段代码走过每一个阶段。

## 阶段 1：词法分析

**文件：** `src/lexer/` — 详见 [词法分析器](the-lexer.md)。

词法分析器逐字符读取源码，生成一系列 token：

```
OpenTag          <?php
Variable("x")   $x
Assign           =
IntLiteral(10)   10
Semicolon        ;
If               if
LParen           (
Variable("x")   $x
Greater          >
IntLiteral(5)    5
RParen           )
LBrace           {
Echo             echo
StringLiteral("big\n")  "big\n"
Semicolon        ;
RBrace           }
Eof
```

每个 token 还携带一个 **Span**——其行号和列号，用于错误报告。

## 阶段 2：语法解析

**文件：** `src/parser/` — 详见 [语法解析器](the-parser.md)。

解析器读取 token 流，构建**抽象语法树**（AST）：

```
Program [
    Assign {
        name: "x",
        value: IntLiteral(10)
    },
    If {
        condition: BinaryOp {
            left: Variable("x"),
            op: Gt,
            right: IntLiteral(5)
        },
        then_body: [
            Echo(StringLiteral("big\n"))
        ],
        elseif_clauses: [],
        else_body: None
    }
]
```

该树捕捉了代码的**结构**——`IntLiteral(5)` 是 `Gt` 的右操作数，`Echo` 位于 `If` 的 `then_body` 内部。括号和花括号等 token 细节已经消失——它们在解析阶段已完成使命。

## 阶段 3：魔术常量降级

**文件：** `src/magic_constants.rs`

`__DIR__`、`__FILE__`、`__FUNCTION__`、`__CLASS__`、`__METHOD__`、`__NAMESPACE__` 和 `__TRAIT__` 等魔术常量，会在后续语义处理之前被降级为普通字面量。主文件在此处降级；被包含的文件会在 resolver 解析各文件时完成降级，因此被包含文件会保留各自的文件路径、命名空间和词法作用域。

本示例中没有魔术常量，AST 原样通过。

## 阶段 4：条件编译

**文件：** `src/conditional/`

若程序使用了 elephc 专属的 `ifdef SYMBOL { ... } else { ... }` 块，条件编译处理阶段会根据当前激活的 CLI `--define` 符号对其求值，并在进行任何 include 解析或类型检查之前，从 AST 中移除非激活分支。

本示例中没有 `ifdef` 块，AST 原样通过。

## 阶段 5：自动加载注册表构建

**文件：** `src/autoload/`

在 include 解析之前，elephc 会构建编译期自动加载注册表。该阶段读取项目及 vendor 包中 Composer 的 `autoload` 和 `autoload-dev` 配置，索引 PSR-4 / PSR-0 / classmap 声明，记录 `autoload.files`，并提取受支持的顶层 `spl_autoload_register()` 规则。规则体以符号闭包的形式保留，以便后续对每个缺失的类型符号进行解释执行。

本示例中没有 `composer.json`，也没有 SPL 注册，注册表为空。

## 阶段 6：include 解析

**文件：** `src/resolver/`

若程序包含 `include` 或 `require` 语句，解析器会解析对应文件，对其文件级魔术常量进行降级，并将其 AST 内联。它还会折叠编译期 include 路径表达式，包括命名空间感知的 `const`、`use const` 和 `define()` 引用。

在内联之前，解析器会预扫描每个可静态解析的 include 目标以收集声明。函数、类、接口、trait、enum、packed class 和 extern 声明会被放入编译期声明前置区，使名称解析和类型检查能看到完整的 include 图，即便文件是通过函数、方法、闭包、分支或嵌套 include 加载的。预扫描会将顺序块与互斥的直接 `if` / `elseif` / `else` 链分开跟踪，因此互斥分支中同一个常规 include 目标只会被发现一次，而顺序或可重复循环中的常规 include 仍会触发重复声明错误。通过 include 发现的函数会被重写为隐藏实现，并在各自的 include 点插入运行时标记；代码生成器则将公开函数名作为调度器，派发到实际已加载的实现。若同一直接链中的互斥分支声明了相同的公开函数，只有签名完全匹配时，才会接受这些隐藏实现。

被包含文件中的可执行语句仍留在 include 点处。对于 `include_once` 和 `require_once`，这些可执行语句会被包裹在内部运行时守卫中。该守卫按已解析文件共享，因此跳过的分支、函数、闭包、方法和循环迭代遵循 PHP 的执行顺序，而非编译期遍历顺序。

本示例中没有需要解析的内容，AST 原样通过。

## 阶段 7：名称解析

**文件：** `src/name_resolver/`

在 include 解析与名称解析之间，elephc 会为需要辅助声明的内置接口注入按需加载的 PHP 前置文件：包括 PDO、时区内省 API、`DateTimeZone::listIdentifiers()` 过滤以及 `var_export()`。这些处理阶段在 include 之后运行（以便检测被包含文件中的用法），在名称解析之前运行（以便注入的声明与用户代码走同一条规范名称流水线）。

include 展平完成后，elephc 解析命名空间感知的名称。该阶段应用当前的 `namespace`、所有 `use` / `use function` / `use const` 导入，并在语义分析之前将引用重写为其规范的全限定名称。

本示例中没有命名空间或导入，AST 仍原样通过。

## 阶段 8：静态自动加载展开

**文件：** `src/autoload/`

名称规范化完成后，elephc 运行自动加载解析器。它反复扫描类型引用，跳过已声明或内置的名称，并在第一条需要该类的语句之前，插入由 Composer 索引或符号 SPL 规则生成的文件。Composer 的 `autoload.files` 条目会被前置到入口程序之前，使其顶层副作用优先执行。

被插入的文件在加入主程序前，会依次经历解析、魔术常量降级、include 解析、名称解析和别名处理。该阶段持续迭代，直到传递类图达到稳定状态。

本示例中没有需要自动加载的类引用。

## 阶段 9：早期优化（常量折叠）

**文件：** `src/optimize/`

在类型检查之前，elephc 会运行一个保守的 AST 简化阶段。该阶段折叠那些无需任何类型环境信息即可静态确定结果的表达式。

典型示例包括：

- `2 + 3 * 4` → `14`
- `"hello " . "world"` → `"hello world"`
- `(int)"42"` → `42`
- `2 < 3 ? 8 : 9` → `8`
- `null ?? "fallback"` → `"fallback"`
- `match (1) { 1 => 8, default => 9 }` → `8`
- `[2, 9][0]` / `["a" => 2]["a"]` → `2`

该阶段有意保持局部性并感知副作用。它简化标量计算，但不会跨任意调用或其他可能产生运行时行为的表达式进行推测。更精确的调用纯度和 `may_throw` 推断将在类型检查之后进行，届时 elephc 已有足够的上下文为已知调用目标构建保守的效果摘要。

在本示例中，目前没有可折叠的内容：该阶段不会将 `$x = 10` 传播到后续的 `$x > 5` 比较中。

## 阶段 10：类型检查

**文件：** `src/types/` — 详见 [类型检查器](the-type-checker.md)。

类型检查器遍历 AST，确定每个变量和表达式的类型：

```
$x = 10           →  $x: Int
$x > 5            →  Int > Int → Bool  ✓
echo "big\n"      →  Str  ✓
```

它构建一个**类型环境**——从变量名到类型的映射：

```
{ "x" → Int, "argc" → Int, "argv" → Array(Str) }
```

如果你在 `$x = 10` 之后尝试 `$x = "hello"`，类型检查器会拒绝——elephc 不允许变量改变类型（从 `null` 赋值除外）。检查器还会解析类/接口元数据用于异常处理，因此 `throw` 只接受实现了 `Throwable` 的对象，并且每个 `catch` 目标可以在代码生成阶段被正确匹配。

类型检查成功后，elephc 还会运行一个警告阶段，报告诸如未使用变量和不可达代码等问题。在编译失败的情况下，解析器和检查器都会尝试保守地恢复，通常能在一次运行中报告多个独立的错误。

检查完成后，exports 扫描（`src/exports.rs`）会收集所有标记了 `#[Export]` 的顶层函数，并根据 C-ABI 编组规则验证其签名。只有在使用 `--emit cdylib` 编译时，该结果才有意义——在默认的可执行文件模式下，所有 `#[Export]` 属性都会产生警告并被忽略。详见[共享库](../beyond-php/cdylib.md)。

## 阶段 11：类型检查后的常量传播

**文件：** `src/optimize/`

检查器成功后，elephc 运行一个局部常量传播阶段。

该阶段仍然保守，但已经能够：

- 在顺序代码中前向传播标量局部变量
- 在简单的 `if` 穿透路径上合并相同的标量值
- 在保守的 `switch` 和 `try` / `catch` 穿透路径上合并标量值
- 利用已知的 `switch` 主体和不抛出异常的 `try` 体，将不可达路径的写操作排除在合并之外
- 从使用局部 `?:` 和 `match` 表达式的赋值中推断出统一的标量结果
- 从固定的解构赋值（如 `[$a, $b] = [2, 3]`）中推断标量局部变量
- 在已知循环内部写操作保守可知的情况下，跨简单循环保留无关的标量局部变量，包括简单嵌套的 `switch`、`try/catch/finally`、`foreach`、其他简单嵌套循环形式、局部数组写操作（如 `$items[] = $i` / `$items[0] = $i`）、局部属性写操作（如 `$box->last = $i` / `$box->items[] = $i`），以及如 `unset($tmp)` 这样的定向局部失效，同时保留由 `for` 初始化子句引入的稳定标量值
- 归纳已知循环路径，如 `while(false)`、`do...while(false)`、带有 `break` 的 `while(true)` / `for(;;)`，以及标量环境一致的分支局部循环出口
- 在替换后重新运行折叠，使 `$x ** $y` 等表达式能够折叠为字面量

在本示例中，这一阶段**确实**改变了程序。该阶段可以将 `$x = 10` 前向传播到后续的比较中，重新运行折叠，并将条件有效地转化为 `true`：

```php
<?php
$x = 10;
if (true) {
    echo "big\n";
}
```

## 阶段 12：类型检查后的控制流剪枝

**文件：** `src/optimize/`

检查器成功后，elephc 还会运行第二个优化阶段，该阶段可以在不掩盖类型检查器诊断信息的前提下，剪除死控制流。

该阶段目前处理以下情况：

- 条件为常量的 `if`、`elseif` 和三目运算符
- `while (false)` 和 `for (...; false; ...)`
- 常量 `match` 表达式和可剪枝的 `switch` 前缀
- `return`、`throw`、`break` 或 `continue` 之后的不可达语句
- 穷举的 `if` / `else` 和带有 `default` 的 `switch` 结构之后的死代码
- 可以安全移除的纯表达式语句和纯死子表达式

该阶段还会参考优化器的局部效果摘要。这些摘要跟踪已知的纯/非抛出内置函数、用户函数、静态方法、私有 `$this` 方法、闭包以及能在 `if`、`switch` 和 `try` 路径合并中存活的可调用别名。正是这种额外的精度，让 elephc 能够证明某些 `try` 区域实际上不会抛出异常，从而安全地修剪死处理器。

这种拆分是有意为之的：elephc 早期折叠明显的标量表达式，但等到类型检查之后才移除整个代码块，以便诊断信息仍能看到原始的已检查结构。

在本示例中，`if (true)` 外壳现在被剪除：

```php
<?php
$x = 10;
echo "big\n";
```

## 阶段 13：控制流规范化

**文件：** `src/optimize/`

控制流剪枝之后，elephc 会对剩余的控制流外壳进行规范化。该阶段不尝试证明新的常量；它将结构等价的形式重写为更简单、更统一的 AST 形式，使后续阶段面临更少的特殊情况。

该阶段目前处理以下情况：

- 将 `elseif` 链规范化为嵌套的 `else { if (...) { ... } }`
- 合并兼容的 `if` 头部/尾部，折叠相同的 `if` 分支
- 合并相同的相邻 `switch` case，折叠纯穿透标签
- 将安全的单 case `switch` 外壳重写为 `if`
- 将相同的相邻 `catch` 处理器合并为规范的多捕获子句，并对类型列表进行去重和稳定排序
- 当外层 `finally` 结构冗余时，将其折叠到内层 `try` 中

## 阶段 14：死代码消除

**文件：** `src/optimize/`

规范化之后，elephc 在已规范化的 AST 上运行最终的死代码消除阶段。

该阶段目前处理以下情况：

- 移除空的 `if`、`switch`、`ifdef` 和退化的 `try` 外壳
- 修剪 `return`、`throw`、`break` 或 `continue` 之后的不可达语句
- 将常量 `switch` 执行具体化为实际会运行的语句尾部
- 将安全的非抛出前缀提升到 `try` 块之外
- 简化非抛出的 `try` / `catch` 以及部分非抛出的 `try` / `finally` 穿透情况
- 剪除嵌套守卫矛盾，包括布尔/复合守卫、严格标量检查、松散等价补集以及安全的关系比较补集
- 对结构化的 `if` / `switch` / `try` 形式使用局部 CFG-lite 可达性分析，包括在 `catch` 守卫失效之前进行 switch 抛出路径分析
- 丢弃由早期阶段暴露出的纯表达式语句和其他残余的不可观测语句

在本示例中，没有其他可移除的内容：剩余的赋值和 `echo` 保持原样。

## 阶段 15：EIR 降级、验证与优化

**文件：** `src/ir_lower/`、`src/ir/`、`src/ir_passes/` — 详见 [EIR 设计](the-ir.md)。

默认后端将经过检查和优化的 AST 降级为 elephc IR（EIR），然后在生成任何汇编之前对模块进行验证。EIR 保留了 PHP 可见的求值顺序、所有权操作、调用元数据、运行时辅助函数引用和块结构，同时将物理寄存器和栈布局的确定推迟给目标平台感知的后端处理。

在本示例中，EIR 已经看到的是经过优化的语句列表：

```text
function main:
  store_local $x, 10
  echo "big\n"
  return
```

验证之后，一个不动点优化阶段驱动器（`src/ir_passes/`）会对每个函数反复运行已注册的 EIR 变换阶段，直到没有阶段报告变化为止。当前的阶段集执行[恒等算术折叠](the-ir.md#optimization-passes)（`x + 0` → `x`、`x * 0` → `0` 等）、局部窥孔重写、按块常量折叠、支配感知的公共子表达式消除、循环不变代码外提、CFG 感知的死指令和死存储消除，以及分支简化。一个跨函数的[小函数内联器](the-ir.md#small-function-inlining)会将小型、非递归、无析构器的辅助函数直接拼入调用者，整个流水线在模块级别运行至不动点，使内联与各函数阶段相互促进。在调试和测试构建中，驱动器会在每个阶段之后重新验证每个函数，以便优化 bug 能立即中止编译。这些阶段默认开启，可以通过 [`--no-ir-opt`](../compiling/optimization.md#eir-optimization-passes) 禁用。

精确的文本 IR 包含值 ID、类型、所有权、span 和终结器，但重要的是被移除的 `if` 外壳不会重新出现。`--emit-ir` 会在打印经过优化和验证的文本 EIR 后停止；添加 `--no-ir-opt` 可以看到阶段运行之前的 IR。

## 阶段 16：代码生成

**文件：** `src/codegen_ir/`，以及共享的 `src/codegen/abi/`、`src/codegen/runtime/` 和目标平台辅助文件 — 详见 [代码生成器](the-codegen.md)。

EIR 后端为所选目标平台生成汇编。对于普通控制流，这主要是顺序分支和标签；对于 `try` / `catch` / `finally`，编译器还会在基于 `_setjmp` / `_longjmp` 的异常展开周围额外生成处理器记录和恢复标签。遗留的 AST 后端仅通过 `--ast-backend` 提供；新的 PHP 可见行为预期通过 EIR 实现。至此，本示例已丢失了 `if` 外壳，因此 AArch64 形式比原始源码更简单（已简化，附注释）：

```asm
.global _main
.align 2

_main:
    ; -- prologue: set up stack frame --
    sub sp, sp, #32
    stp x29, x30, [sp, #16]
    add x29, sp, #16

    ; -- $x = 10 --
    mov x0, #10
    stur x0, [x29, #-8]

    ; -- echo "big\n" (the if shell was pruned earlier) --
    adrp x1, _str_0@PAGE
    add x1, x1, _str_0@PAGEOFF
    mov x2, #4                   ; length = 4 ("big" + newline)
    mov x0, #1                   ; fd = stdout
    mov x16, #4                  ; syscall = write
    svc #0x80                    ; call kernel
    ; -- epilogue: exit(0) --
    mov x0, #0
    mov x16, #1
    svc #0x80

.data
_str_0: .ascii "big\n"
```

关键观察：

- `$x = 10` → `mov x0, #10`，然后 `stur` 到帧指针偏移 -8 处的栈上
- `if ($x > 5)` 检查在代码生成时已不复存在，因为常量传播和剪枝已将其移除
- `echo "big\n"` → 加载字符串地址和长度，然后 `svc` 写入 stdout
- 字符串字面量位于 `.data` 节，由标签 `_str_0` 引用

## 阶段 17：运行时准备、汇编与链接

**工具：** 原生 `as` 和 `ld`（或等效的系统工具链）

elephc 首先准备共享运行时对象，然后将用户汇编写入 `.s` 文件，最后调用系统工具。

运行时不会在每次编译时重新汇编。elephc 使用编译器版本、目标平台、堆大小以及生成的运行时汇编哈希作为缓存键，将预汇编好的运行时对象缓存在用户的缓存目录下（通常为 `~/.cache/elephc/`）。若已存在匹配的对象，编译时直接复用。

用户程序仍会获得自己的汇编文件。若启用了 `--source-map`，elephc 还会写出一个附属的 `.map` JSON 文件，记录在语句生成时插入的源码标记所提取的汇编行到 PHP 行/列的源码映射。

在普通编译模式下，工具链流程如下：

1. 准备或复用缓存的运行时对象
2. 将程序汇编写入 `file.s`
3. 可选写出 `file.map`
4. 将 `file.s` 汇编为 `file.o`
5. 将 `file.o` 与缓存的运行时对象链接为最终可执行文件

若启用了 `--timings`，elephc 会将每个主要阶段的耗时打印到 stderr，以便查看时间分布。

elephc 随后调用系统工具：

在 macOS 上，elephc 直接驱动 Apple 工具链：

```bash
as -arch arm64 -o file.o file.s
ld -arch arm64 -e _main -o file file.o -lSystem -syslibroot /path/to/sdk
```

在 Linux 上，elephc 会为所请求的目标平台调用原生汇编器/链接器。

- **`as`**（汇编器）将用户汇编文本助记符转换为二进制机器码，生成目标文件（`.o`）
- **`ld`**（链接器）解析标签地址，将用户目标文件与缓存的运行时对象及任何请求的系统库链接，生成最终的原生二进制文件（macOS 上为 Mach-O，Linux 上为 ELF）

链接完成后，`.o` 文件会被删除。最终结果是一个独立的可执行文件。

使用 `--emit cdylib` 时，相同的流程会生成共享库：代码生成器生成无 `main` 入口的位置无关代码，PIC 变体的运行时对象单独准备（按其汇编哈希独立缓存），链接器以 `-dylib`（macOS）或 `-shared`（Linux）方式调用，生成 `lib<name>.dylib` / `lib<name>.so`。

## 阶段 18：执行

```bash
./file
big
```

二进制文件直接在 CPU 上运行。运行时没有 PHP 解释器或虚拟机。内核将目标平台的可执行文件加载到内存中，跳转到入口点，CPU 执行我们生成的指令。该二进制文件仍包含 elephc 生成的辅助例程，并链接了平台系统库以使用操作系统/libc 服务。

## 完整流程

```
"<?php $x = 10; if ($x > 5) { echo \"big\\n\"; }"
                    │
                    ▼ Lexer
    [OpenTag, Variable("x"), Assign, IntLiteral(10), ...]
                    │
                    ▼ Parser
    [Assign{x, 10}, If{Gt(Var(x), 5), [Echo("big\n")]}]
                    │
                    ▼ Magic constants (no-op here)
                    │
                    ▼ Conditional (ifdef no-op here)
                    │
                    ▼ Resolver (no-op here)
                    │
                    ▼ Demand-loaded preludes (no-op here)
                    │
                    ▼ NameResolver (no-op here)
                    │
                    ▼ Optimizer (fold constants, no-op here)
    [Assign{x, 10}, If{Gt(Var(x), 5), [Echo("big\n")]}]
                    │
                    ▼ Type Checker
    { x: Int } — all types consistent ✓
                    │
                    ▼ Optimizer (constant propagation)
    [Assign{x, 10}, If{true, [Echo("big\n")]}]
                    │
                    ▼ Optimizer (prune dead control flow)
    [Assign{x, 10}, Echo("big\n")]
                    │
                    ▼ Optimizer (normalize control flow, no-op here)
    [Assign{x, 10}, Echo("big\n")]
                    │
                    ▼ Optimizer (dead-code elimination, no-op here)
    [Assign{x, 10}, Echo("big\n")]
                    │
                    ▼ EIR lowering + validation
    main stores x=10, echoes "big\n", returns
                    │
                    ▼ EIR Code Generator
    "sub sp, sp, #32 / stp x29, x30, ... / mov x0, #10 / adrp x1, _str_0 / ..."
                    │
                    ▼ Runtime Cache
    ~/.cache/elephc/runtime-v<version>-<target>-rt<hash>-heap<size>.o
                    │
                    ▼ optional Source Map
    file.map (asm line → PHP line/col)
                    │
                    ▼ as (assembler)
    file.o (machine code bytes for user program)
                    │
                    ▼ ld (linker)
    file (user object + cached runtime object)
                    │
                    ▼ CPU
    "big\n"
```
