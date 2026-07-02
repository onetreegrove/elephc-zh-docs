---
title: "CLI 参考"
description: "elephc 命令行标志、接受的值、默认值以及环境变量覆盖的完整且权威的列表。"
sidebar:
  order: 3
---

本页面列出了 `elephc` 命令接受的每个标志。专题页面（[优化](optimization.md)、[输出](output-and-diagnostics.md)、[链接](linking-and-conditional-compilation.md)）解释了“为什么”；本页面则是详尽的“是什么”。

## 概要

```text
elephc [OPTIONS] <source.php>
```

仅需一个位置参数：PHP 源文件的路径。生成的二进制文件将写入该源文件同级目录下，并以不带扩展名的源文件名命名。

## 输入和输出

| 标志 | 值 | 默认值 | 描述 |
|---|---|---|---|
| `<source.php>` | 路径 | — | 必填。要编译的 PHP 文件。 |
| `--emit KIND` / `--emit=KIND` | `executable` (`exe`, `bin`), `cdylib` (`dylib`, `shared`) | `executable` | 输出产物类型。`cdylib` 会构建一个 C-ABI 共享库。 |
| `--emit-asm` | — | 关闭 | 写入生成的汇编而不是二进制文件。 |
| `--emit-ir` | — | 关闭 | 打印 EIR 文本形式并停止。 |
| `--check` | — | 关闭 | 仅运行前端检查；不写入任何内容。 |
| `--source-map` | — | 关闭 | 在汇编文件旁输出一个 `.map` 源码映射伴随文件。 |
| `--web` | — | 关闭 | 编译成 prefork HTTP 服务器二进制文件，而不是 CLI 可执行文件。参见 [Web 服务器](../beyond-php/web.md)。 |

`--emit-ir`、`--emit-asm` 和 `--check` 相互排斥。`--web` 不能与 `--check`、`--emit cdylib`、`--emit-asm` 或 `--emit-ir` 结合使用。参见[输出格式与诊断](output-and-diagnostics.md)。

## Web 服务器二进制文件运行时参数

当使用 `--web` 编译程序时，生成的二进制文件接受以下运行时参数（而非 elephc 编译器标志）：

| 参数 | 必填 | 默认值 | 描述 |
|---|---|---|---|
| `--listen host:port` | 是 | — | 要绑定的地址和端口。若缺少 `--listen`，则向 stderr 打印错误并以非零状态码退出。 |
| `--workers N` | 否 | CPU 核心数 | prefork 工作进程的数量。最小为 1。 |
| `--max-body-size N` | 否 | `8388608` (8 MiB) | 最大请求体字节数（`0` = 无限制）；超限的请求体将返回 `413`。 |
| `--max-requests N` | 否 | `0`（从不） | 在处理 N 次请求后回收每个工作进程（限制内存增长）。 |
| `--access-log` | 否 | 关闭 | 向 stderr 记录每次请求的一行访问日志。 |
| `--help`, `--version` | 否 | — | 打印使用方法/版本并退出。 |

```bash
elephc --web app.php
./app --listen 127.0.0.1:8080
./app --listen 0.0.0.0:8080 --workers 4 --max-body-size 1048576 --access-log
```

提供服务的程序还会接收到 `$_COOKIE`、`$_REQUEST` 和 `$_ENV`，并且可以通过 `setcookie()` 发送 Cookie。服务器在收到 `SIGINT`/`SIGTERM` 时会安全关闭，并重新拉起已退出的工作进程。

提供服务的程序通过标准超全局变量 `$_SERVER`、`$_GET`、`$_POST` 和 `php://input` 接收 HTTP 请求，并使用 `http_response_code()` 和 `header()` 控制响应状态码和响应头。参见 [Web 服务器](../beyond-php/web.md#request-input)。

## 目标平台

| 标志 | 值 | 默认值 | 描述 |
|---|---|---|---|
| `--target TARGET` / `--target=TARGET` | `macos-aarch64`, `linux-aarch64`, `linux-x86_64`（以及别名拼写） | 宿主平台 | 选择编译目标平台。 |

有关接受的完整拼写列表，请参见[目标平台与交叉编译](targets.md)。

## 优化与代码生成

| 标志 | 值 | 默认值 | 环境变量覆盖 | 描述 |
|---|---|---|---|---|
| `--ir-opt=on\|off` | `on`, `off` | `on` | `ELEPHC_IR_OPT` | 启用或禁用 EIR 优化通道：恒等折叠、窥孔优化、常量折叠、公共子表达式消除、循环不变代码外提、死指令消除、死存储消除、分支简化，以及跨函数的小函数内联器 —— 运行至模块级不动点。 |
| `--no-ir-opt` | — | — | `ELEPHC_IR_OPT=off` | `--ir-opt=off` 的简写。 |
| `--regalloc=linear\|stack` | `linear`, `stack` | `linear` | `ELEPHC_REGALLOC` | 寄存器分配器：线性扫描，或仅限栈的备用方案。 |
| `--null-repr=sentinel\|tagged` | `sentinel`, `tagged` | `tagged` | `ELEPHC_NULL_REPR` | 可为 null 的标量槽的表示方式。 |
| `--ir-backend` | — | on | — | 强制使用 EIR 后端（已是默认设置）。 |
| `--ast-backend` | — | off | — | **已弃用。** 遗留的直接 AST 后端；计划在 v0.26.0 版本中移除。 |

`--ir-backend` 和 `--ast-backend` 不能结合使用。参见[优化与代码生成控制](optimization.md)。

## 链接与 FFI

| 标志 | 值 | 默认值 | 描述 |
|---|---|---|---|
| `--link LIB` / `-l LIB` / `-lLIB` | 库名称 | — | 链接额外的原生库（可多次指定）。 |
| `--link-path DIR` / `-L DIR` / `-LDIR` | 目录 | — | 添加库搜索路径（可多次指定）。 |
| `--framework NAME` | 框架名称 | — | 链接 macOS 框架（可多次指定）。 |

参见[链接、堆与条件编译](linking-and-conditional-compilation.md)。

## 内存与条件编译

| 标志 | 值 | 默认值 | 描述 |
|---|---|---|---|
| `--heap-size=BYTES` | 整数 ≥ 65536 | `8388608` (8 MB) | 程序运行时堆的大小。 |
| `--define SYMBOL` / `--define=SYMBOL` | 符号名称 | — | 为 `ifdef` 定义编译时符号（可多次指定）。 |

## 诊断与调试

| 标志 | 值 | 默认值 | 描述 |
|---|---|---|---|
| `--timings` | — | 关闭 | 向 stderr 打印编译器每个阶段的耗时。 |
| `--gc-stats` | — | 关闭 | 在退出时打印内存分配/释放计数器。 |
| `--heap-debug` | — | 关闭 | 启用运行时堆校验（重复释放、错误的引用计数、空闲列表损坏）。 |

参见[输出格式与诊断](output-and-diagnostics.md)。

## 环境变量

三个环境变量提供了可被对应标志覆盖的默认值。它们的存在主要是为了让整个测试运行或基准测试能够切换默认值，而无需更改每一次调用：

| 变量 | 值 | 等效标志 |
|---|---|---|
| `ELEPHC_IR_OPT` | `on`, `off` | `--ir-opt=` |
| `ELEPHC_REGALLOC` | `linear`, `stack` | `--regalloc=` |
| `ELEPHC_NULL_REPR` | `tagged`, `sentinel` | `--null-repr=` |
