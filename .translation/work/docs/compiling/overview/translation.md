---
title: "编译概览"
description: "elephc 命令行编译器如何将 PHP 文件转换为独立的原生二进制文件（native binary），以及编译文档的结构导览。"
sidebar:
  order: 1
---

elephc 是一个超前编译器（ahead-of-time compiler）：它读取一个 `.php` 文件，生成一个独立的原生二进制文件（native binary），不依赖解释器、虚拟机和任何运行时。生成的程序是纯机器码，链接了一个小型手写运行时，该运行时直接嵌入到可执行文件中。

## 基本调用

```bash
elephc hello.php
./hello
```

编译器将输出的二进制文件写到源文件同级目录，文件名取源文件名去掉扩展名（`hello.php` → `hello`）。默认情况下不会产生其他文件——不会留下中间目标文件，也不会污染项目目录的缓存。

```bash
elephc src/app.php     # produces ./src/app
./src/app
```

## 编译过程

一次编译会按固定顺序执行以下阶段：词法分析、语法解析、名称解析、类型检查、AST 优化、降级到 elephc 中间表示（EIR）、EIR 优化、原生代码生成，以及链接。各阶段的详细介绍见[编译流水线](compilation-pipeline.md)，你可以通过 [`--timings`](output-and-diagnostics.md#--timings) 查看每个阶段的耗时。

编译器的默认行为：

- 以**宿主**平台为目标平台（参见[目标平台与交叉编译](targets.md)），
- 使用 **EIR 后端**，启用**线性扫描寄存器分配器**和 **EIR 优化 pass**（参见[优化与代码生成控制](optimization.md)），
- 输出原生**可执行文件**（参见[输出格式与诊断信息](output-and-diagnostics.md)），
- 堆大小默认为 **8 MB**（参见[链接、堆与条件编译](linking-and-conditional-compilation.md#heap-size)）。

上述所有默认值均可通过命令行标志修改。

## 无运行时，单文件

程序所需的运行时例程（字符串格式化、分配器、引用计数 GC、哈希表、I/O、异常展开等）会以汇编形式生成并直接链接到二进制文件中。最终结果是一个完全自包含的可执行文件，你可以将其复制到同一目标平台的另一台机器上直接运行。具体包含哪些例程，请参见[运行时](../internals/the-runtime.md)。

## 文档导览

| 页面 | 内容 |
|---|---|
| [编译流水线](compilation-pipeline.md) | 从源代码到二进制文件的每个阶段，按顺序说明 |
| [CLI 参考](cli-reference.md) | 所有标志的完整权威列表 |
| [目标平台与交叉编译](targets.md) | 支持的目标平台矩阵及 `--target` |
| [优化与代码生成控制](optimization.md) | `--regalloc`、`--ir-opt`、`--null-repr` 及其作用 |
| [输出格式与诊断信息](output-and-diagnostics.md) | `--emit`、`--emit-asm`、`--emit-ir`、`--check`、`--timings`、`--source-map`、`--gc-stats`、`--heap-debug` |
| [链接、堆与条件编译](linking-and-conditional-compilation.md) | `--link`、`--link-path`、`--framework`、`--heap-size`、`--define` |

关于这些阶段背后的内部机制，请参见[流水线](../internals/how-elephc-works.md)、[代码生成器](../internals/the-codegen.md)和 [EIR 设计](../internals/the-ir.md)。
