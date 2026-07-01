---
title: "安装"
description: "如何在支持的平台上安装 elephc。"
sidebar:
  order: 1
---

## 环境要求

- 如需从源码构建，需安装 Rust 工具链（`cargo`）
- 宿主平台原生的汇编器和链接器

在 macOS 上，若尚未安装 Xcode Command Line Tools，请先运行：

```bash
xcode-select --install
```

此命令将安装 elephc 用于生成原生二进制文件（native binary）所需的汇编器（`as`）和链接器（`ld`）。

在 Linux 上，请安装所在发行版的标准原生工具链，确保 `as`、`ld` 以及 libc 开发文件可用。

## Homebrew（macOS）

```bash
brew install illegalstudio/tap/elephc
```

通过编译一个小程序来验证安装是否成功：

```bash
echo '<?php echo "ok\n";' > check.php
elephc check.php && ./check
```

若输出 `ok`，则说明 `elephc` 已能正常生成并运行原生二进制文件。

## 从源码构建

如需从源码构建，还需安装 Rust 工具链（`cargo`）。

```bash
git clone https://github.com/illegalstudio/elephc.git
cd elephc
cargo build --release
```

编译产物位于 `./target/release/elephc`。将其复制到 `PATH` 中的某个目录：

```bash
cp target/release/elephc /usr/local/bin/
```

## 从 GitHub Releases 下载

预编译的原生二进制文件可在 [releases 页面](https://github.com/illegalstudio/elephc/releases) 获取。下载对应平台的产物，必要时赋予可执行权限，然后移动到 `PATH` 中：

```bash
chmod +x elephc
mv elephc /usr/local/bin/
```
