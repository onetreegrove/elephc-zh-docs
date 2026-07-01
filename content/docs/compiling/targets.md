---
title: "目标平台与交叉编译"
description: "支持的目标平台矩阵、如何通过 --target 选择目标平台，以及可接受的目标平台拼写格式。"
sidebar:
  order: 4
---

elephc 将代码编译为固定一组一等目标平台（first-class targets）的原生机器码。
所有受支持的目标平台地位相同：某个功能只有在所有目标平台上都正常工作，才算真正完成。

## 支持的目标平台矩阵

| 目标平台 | 操作系统 | 架构 |
|---|---|---|
| `macos-aarch64` | macOS | ARM64（Apple Silicon） |
| `linux-aarch64` | Linux | ARM64 |
| `linux-x86_64` | Linux | x86-64 |

默认情况下，编译器会自动检测并以其运行所在的**宿主机**作为目标平台。

## 选择目标平台

```bash
elephc --target linux-aarch64 hello.php
elephc --target linux-x86_64 hello.php
elephc --target=macos-aarch64 hello.php
```

空格形式（`--target VALUE`）和内联形式（`--target=VALUE`）均可使用。

## 可接受的拼写格式

每个目标平台支持多种拼写形式，包括 LLVM 风格的三元组（triple），以便为其他工具链编写的构建脚本保持兼容：

| 规范形式 | 同样可接受 |
|---|---|
| `macos-aarch64` | `macos-arm64`, `aarch64-apple-darwin` |
| `linux-aarch64` | `linux-arm64`, `aarch64-unknown-linux-gnu` |
| `linux-x86_64` | `x86_64-unknown-linux-gnu` |

## 交叉编译说明

选择与宿主机不同的目标平台，将为该目标平台生成汇编文件和目标文件（object file）。
若要生成最终的链接二进制文件，仍需在该平台上具备链接器以及对应的目标库；
elephc 测试套件使用 `scripts/` 下的 Docker 脚本，从 macOS 宿主机构建并运行 Linux 目标平台。

有关各平台目标感知 ABI 与运行时的详细信息，请参阅
[架构](../internals/architecture.md) 和
[代码生成器](../internals/the-codegen.md)。
