---
title: "输出格式与诊断"
description: "选择编译器产物（可执行文件、cdylib、汇编、IR）以及用于检查或分析编译过程的各项标志。"
sidebar:
  order: 6
---

默认情况下，`elephc` 会生成一个原生二进制文件（native binary）。以下标志可改变输出产物，或提前终止编译流水线以检查中间阶段，同时提供用于分析编译过程或编译结果程序的诊断功能。

## 输出产物

### `--emit`

选择要生成的产物类型。

```bash
elephc --emit executable app.php   # default: a native binary
elephc --emit cdylib lib.php       # a C-ABI shared library
```

可接受的值及别名：

| 值 | 别名 | 产物 |
|---|---|---|
| `executable` | `exe`, `bin` | 独立的原生二进制文件。 |
| `cdylib` | `dylib`, `shared` | C-ABI 共享库（`.dylib`/`.so`）。 |

内联形式 `--emit=cdylib` 同样有效。如需从 `cdylib` 中导出 C-ABI 函数，请参阅 [共享库（cdylib）](../beyond-php/cdylib.md)。

### `--emit-asm`

将生成的汇编代码写入源文件旁边，而非进行汇编和链接生成二进制文件。适用于检查后端的确切输出。

```bash
elephc --emit-asm hello.php
```

### `--emit-ir`

将 EIR（elephc 的中间表示）文本形式打印到 stdout，并在代码生成前停止。由于该过程在 [EIR 优化遍](optimization.md#eir-optimization-passes) 之后运行，输出反映的是优化后的 IR；可结合 [`--no-ir-opt`](optimization.md#eir-optimization-passes) 查看未优化的形式。

```bash
elephc --emit-ir hello.php
elephc --emit-ir --no-ir-opt hello.php
```

关于如何阅读输出内容，请参阅 [EIR 设计](../internals/the-ir.md)。

### `--check`

运行前端——词法分析、语法分析、名称解析、类型检查——并报告错误和警告，不生成任何汇编或二进制文件。这是验证文件的最快方式。

```bash
elephc --check hello.php
```

`--emit-ir`、`--emit-asm` 和 `--check` 三者互斥。

### `--source-map`

在生成的汇编文件旁边生成一个 `.map` 附属文件，将汇编位置映射回 PHP 源码位置（源码映射）。

```bash
elephc --emit-asm --source-map hello.php
```

## 编译时诊断

### `--timings`

将每个编译阶段的耗时打印到 stderr。标签与[编译流水线阶段](compilation-pipeline.md)一一对应。

```bash
elephc --timings hello.php
```

## 运行时诊断

以下标志用于分析**已编译的程序**，而非编译器本身。

### `--gc-stats`

编译程序时启用此选项，程序退出时会将内存分配和释放计数器打印到 stderr——在调试引用计数和所有权行为时非常有用。

```bash
elephc --gc-stats heavy.php
./heavy
```

### `--heap-debug`

在编译后的程序中启用运行时堆验证：包括双重释放检测、错误引用计数检查以及空闲链表损坏检查。速度较慢，但在排查内存问题时极为有价值。

```bash
elephc --heap-debug heavy.php
./heavy
```

关于这些选项所报告的内容，请参阅 [内存模型](../internals/memory-model.md) 和 [运行时](../internals/the-runtime.md)。
