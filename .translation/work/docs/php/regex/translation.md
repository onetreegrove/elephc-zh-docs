---
title: "Regex"
description: "基于 PCRE2 的正则表达式、preg_* 函数、SPL regex 迭代器以及原生库依赖。"
sidebar:
  order: 6
---

elephc 通过 PCRE2 的 POSIX 兼容包装器，使用 PCRE2 实现了 PHP 正则表达式。正则支持是一项可选的运行时功能：不使用正则的程序不会链接 PCRE2，而使用 `preg_*`、`RegexIterator` 或 `RecursiveRegexIterator` 的程序会在最终的原生链接步骤中请求 PCRE2。

## 构建要求

构建 `elephc` 本身不需要 PCRE2：

```bash
cargo build
```

当编译生成的原生二进制文件（native binary）可能调用正则辅助函数时，编译该 PHP 程序需要 PCRE2。elephc 会自动添加所需的原生库：

```text
-lpcre2-posix -lpcre2-8
```

在编译使用正则的程序之前，请先安装 PCRE2 开发包：

| 平台 | 命令 |
|---|---|
| 使用 Homebrew 的 macOS | `brew install pcre2` |
| Debian / Ubuntu | `sudo apt install libpcre2-dev` |
| Alpine Linux | `apk add pcre2-dev` |
| Fedora | `sudo dnf install pcre2-devel` |
| Arch Linux | `sudo pacman -S pcre2` |

在 macOS 上，当链接可选的原生依赖时，elephc 会自动搜索 `/opt/homebrew/lib` 和 `/usr/local/lib`。在 Linux 上，系统包通常会将 PCRE2 安装到默认的链接器搜索路径中。如果 PCRE2 安装在自定义前缀路径下，请显式传递库目录：

```bash
cargo run -- --link-path /opt/pcre2/lib path/to/program.php
```

`scripts/test-linux-x86_64.sh` 和 `scripts/test-linux-arm64.sh` 所使用的项目 Docker 镜像中已包含 `pcre2-dev`；在修改 Dockerfile 后，可使用 `--rebuild` 重新构建镜像。

## 编译正则程序

示例 PHP 源码：

```php
<?php
$subject = "order-42";

if (preg_match('/order-(\d+)/', $subject, $matches)) {
    echo $matches[1];
}
```

使用与编译和运行其他 elephc 程序相同的方法：

```bash
cargo run -- path/to/program.php
./path/to/program
```

当 PCRE2 安装在已知的链接器路径时，无需手动传递 `--link pcre2-posix` 或 `--link pcre2-8` 标志；当被检查的程序中存在正则时，elephc 会请求这些库。

常见的链接器失败通常意味着未找到原生的 PCRE2 库：

| 错误形式 | 解决方法 |
|---|---|
| `library not found for -lpcre2-posix` | 使用 Homebrew 安装 PCRE2，或者为自定义前缀传递 `--link-path` |
| `cannot find -lpcre2-posix` | 安装对应平台的 PCRE2 开发包 |
| `undefined reference to pcre2_*` | 在进行手动链接实验时，确保 `pcre2-posix` 和 `pcre2-8` 均可用 |

## 支持的函数

| 函数 | 签名 | 描述 |
|---|---|---|
| `preg_match()` | `preg_match($pattern, $subject, &$matches = null): int` | 测试正则匹配（返回 1 或 0）；可选的 `$matches` 接收完整匹配和捕获组 |
| `preg_match_all()` | `preg_match_all($pattern, $subject): int` | 计算所有非重叠匹配的次数 |
| `preg_replace()` | `preg_replace($pattern, $replacement, $subject): string` | 替换所有正则匹配；替换反向引用 `$0`..`$99` 和 `\0`..`\99` 会展开为已捕获的组 |
| `preg_replace_callback()` | `preg_replace_callback($pattern, $callback, $subject): string` | 用回调函数的返回值替换所有正则匹配；回调函数接收 `array<string>` 匹配项 |
| `preg_split()` | `preg_split($pattern, $subject, $limit = -1, $flags = 0): array` | 通过正则分割字符串；支持排除空项、捕获分隔符、捕获偏移量以及正数限制 |

## 模式语法

PCRE 语法会直接传递给 PCRE2，因此先行断言（lookahead）、后行断言（lookbehind）、惰性量词（lazy quantifiers）、字符类简写（shorthand classes）和 Unicode 属性转义均可用。支持 PHP 风格的使用斜线分隔的模式，并且 elephc 会将这些尾随修饰符映射到 PCRE2 包装器标志：

| 修饰符 | 含义 |
|---|---|
| `i` | 不区分大小写匹配 |
| `m` | 多行锚点行为 |
| `s` | 单行模式（Dotall）；`.` 可以匹配换行符 |
| `u` | UTF-8 和 Unicode 属性匹配 |
| `U` | 非贪婪匹配 |

目前暂未映射其他尾随修饰符到 PCRE2 标志。

## 捕获与替换

`preg_match()` 支持可选的 `$matches` 输出参数。`$matches[0]` 是完整匹配，从 `$matches[1]` 开始包含编译后的编号捕获组。未匹配的内部捕获组为空字符串；尾随的未匹配组将被忽略。

`preg_replace()` 会将 `$0`..`$99` 和 `\0`..`\99` 展开为捕获组。未匹配的可选组和缺失的组会展开为空字符串。

`preg_replace_callback()` 会将相同结构的 `$matches` 数组传递给回调函数。当回调函数存储在变量中或通过 `callable` 参数传递时，基于描述符的闭包捕获（descriptor-backed closure captures）和首类可调用对象接收器（first-class-callable receivers）均会被保留。运行时字符串回调变量可以指向用户函数和公共静态方法，而当运行时字符串选定它们时，可调用数组（callable-array）变量（例如 `[$object, $method]` 和 `[$class, $method]`）可以指向公共方法。

## 分割标志

`preg_split()` 支持：

| 常量 | 行为 |
|---|---|
| `PREG_SPLIT_NO_EMPTY` | 丢弃分割出的空元素 |
| `PREG_SPLIT_DELIM_CAPTURE` | 在结果中包含分隔符捕获组 |
| `PREG_SPLIT_OFFSET_CAPTURE` | 返回值/偏移量对 |

支持正数限制。

## SPL 正则迭代器

`RegexIterator` 和 `RecursiveRegexIterator` 使用与 `preg_*` 函数相同、基于 PCRE2 的运行时。它们支持的模式和标志记录在 [SPL](spl.md) 文档中。使用这两个类中的任何一个，都会使生成的二进制文件在链接时请求 PCRE2。

## 当前局限性

- PCRE2 目前是一个外部原生依赖，而非内置的静态库。未来的依赖工作流可能会提供类似于 `elephc lib add pcre2` 的命令，但该命令目前尚不存在。
- 正则运行时检测在处理动态 `instanceof` 时较为保守：可能会动态引用已生成的 SPL 正则类的程序，即使没有直接调用 `preg_*`，也可能会链接 PCRE2。
- 目前只有上面列出的模式修饰符会被映射到 PCRE2 标志。
