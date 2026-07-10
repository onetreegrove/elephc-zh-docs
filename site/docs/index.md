---
title: "elephc 文档"
description: "PHP 到原生编译器。将 PHP 的静态子集编译为原生汇编，并为支持的目标平台生成独立二进制文件。"
sourcePath: "docs/README.md"
translationMode: "refined"
---

# elephc 文档

elephc 会把 PHP 编译为当前支持目标平台上的原生二进制文件：macOS ARM64、Linux ARM64 和 Linux x86_64。它不依赖解释器、虚拟机或运行时环境。本中文文档覆盖从 PHP 语法支持、编译器扩展到内部架构的核心内容。

## 快速开始

- 安装 elephc
- 编写第一个 PHP 程序
- 编译并运行原生二进制文件
- 理解支持的目标平台和构建依赖

## 主要内容

- 编译流程与 CLI 参数
- PHP 语法和标准库支持范围
- Beyond PHP：指针、buffer、packed class、FFI、条件编译、web server 和 cdylib
- 编译器内部：词法分析、解析器、类型检查器、EIR、代码生成、运行时和内存模型
- 案例展示：HTTP server、DOOM 渲染等

## 来源

本文基于上游 `docs/README.md` 翻译和整理。完整内容会在后续增量翻译流程中持续补齐。
