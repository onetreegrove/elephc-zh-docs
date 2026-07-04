---
title: "stream_socket_shutdown() —— 内部实现"
description: "stream_socket_shutdown() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 222
---

## `stream_socket_shutdown()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2522](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2522) (`lower_stream_socket_shutdown`)
- **函数符号**: `lower_stream_socket_shutdown()`


### Lowering 说明

- 对 `stream_socket_shutdown(stream, mode)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_socket_shutdown`

## 签名摘要

```php
function stream_socket_shutdown(resource $stream, int $mode): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`stream_socket_shutdown()` 用户参考](../../../php/builtins/io/stream_socket_shutdown.md)
