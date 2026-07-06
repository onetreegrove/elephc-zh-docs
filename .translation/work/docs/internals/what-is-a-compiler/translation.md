---
title: "什么是编译器？"
description: "源代码是如何变成一个程序的。"
sidebar:
  order: 1
---

## 问题所在

你用人类可读的语言编写代码——PHP、Python、Rust、C。但 CPU 并不理解这些。CPU 只能理解**机器码**：由字节序列编码的特定操作，例如"将这两个数相加"或"跳转到这个地址"。

需要有某种东西来弥合人类可读的源代码与机器可执行字节之间的鸿沟。这个"某种东西"就是**编译器**或**解释器**。

## 编译器 vs. 解释器

**解释器**读取你的源代码并逐行即时执行。PHP 通常就是这样工作的——`php script.php` 读取文件，理解每一行的含义，然后立即执行。没有单独的"已编译"文件。

**编译器**读取你的源代码，并将其翻译成另一种形式——通常是机器码——*在任何代码运行之前*完成。输出是一个独立的程序（二进制文件），CPU 可以直接执行。C 和 Rust 就是这样工作的。

```
Interpreter:  source code → [interpreter reads + executes] → output
Compiler:     source code → [compiler translates] → binary → [CPU executes] → output
```

关键区别在于：解释器在运行时始终存在，边翻译边执行。而已编译的二进制文件可以独立运行——不需要翻译器。

## elephc 做了什么

elephc 是一个编译器。它接收 PHP 源代码，并为所支持的目标平台生成原生二进制文件（native binary）。不涉及任何 PHP 解释器。输出是一个独立的可执行文件，就像用 `gcc` 编译的 C 程序一样。

```
hello.php → elephc → hello (native executable) → runs directly on CPU
```

生成的二进制文件不依赖 PHP，也不包含解释器或虚拟机。它包含 elephc 生成的辅助例程，并链接平台的原生系统库，以使用操作系统和 libc 服务。

## 编译的各个阶段

每个编译器，无论简单还是复杂，都遵循类似的流水线。每个阶段将程序转换为更接近机器码的表示形式：

```
Source text    "if ($x > 0) { echo $x; }"
     │
     ▼
Tokens         [If, LParen, Variable("x"), Greater, Int(0), RParen, LBrace, Echo, Variable("x"), ...]
     │
     ▼
AST            If { condition: BinaryOp(Gt, Var("x"), Int(0)), body: [Echo(Var("x"))] }
     │
     ▼
Typed AST      Same tree, but now we know $x is an Int
     │
     ▼
Assembly       cmp x0, #0 / b.le _else_1 / ... / _else_1:
     │
     ▼
Machine code   Binary executable (native format for the chosen platform)
```

每个阶段都有明确的职责：

| 阶段 | 输入 | 输出 | 职责 |
|---|---|---|---|
| [词法分析器](the-lexer.md) | 源文本 | 词法单元 | 将文本拆分为有意义的词语 |
| [解析器](the-parser.md) | 词法单元 | AST | 理解结构（什么嵌套在什么内部） |
| [类型检查器](the-type-checker.md) | AST | 带类型的 AST | 推断并验证数据类型 |
| [代码生成器](the-codegen.md) | 带类型的 AST | 汇编 | 将每个构造翻译为 CPU 指令 |
| 汇编器（`as`） | 汇编文本 | 目标文件 | 将文本助记符转换为二进制操作码 |
| 链接器（`ld`） | 目标文件 | 可执行文件 | 解析地址，生成最终的二进制文件 |

elephc 负责前四个阶段。后两个阶段（汇编器和链接器）委托给宿主工具链处理。

## 为什么要编译 PHP？

PHP 通常是解释执行的，这对 Web 服务器来说完全没问题。那为什么要编译它呢？

编译 PHP 可以将其转换为快速、独立的原生二进制文件，无需解释器、虚拟机或运行时依赖——你只需交付一个单独的可执行文件。PHP 也是一门非常适合编译的语言：它的语法简单到足以处理，却又丰富到足够有趣（字符串、数组、函数、控制流、类型强制转换），而且数百万开发者已经熟悉它。

输出是*真实的汇编代码*，这意味着你可以看到 CPU 对每个 PHP 构造具体做了什么。许多内部文档使用 AArch64 示例，因为这是最初的后端，也是最具解释性的路径，但同一编译器流水线现在支持不止一个平台/架构组合。`echo 1 + 2` 并不神秘——它是几次数据移动、一次加法、一次对转换例程的调用，以及一次系统调用。你可以追踪每一个步骤。
