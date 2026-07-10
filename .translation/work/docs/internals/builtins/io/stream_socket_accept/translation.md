---
title: "stream_socket_accept() —— 内部实现"
description: "stream_socket_accept() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 214
---

## `stream_socket_accept()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2436](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2436) (`lower_stream_socket_accept`)
- **函数符号**: `lower_stream_socket_accept()`


### Lowering 说明

- 对 `stream_socket_accept(server, timeout?, peer_name?)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_socket_accept`

## 签名摘要

```php
function stream_socket_accept(resource $socket, float $timeout, string $peer_name): mixed
```

## 类型检查器约束

- **参数数量 (Arity)**: 接受 1–3 个参数（其中 2 个可选）。
- **引用传递参数**: `$peer_name`。

## 交叉引用

- [`stream_socket_accept()` 用户参考](../../../php/builtins/io/stream_socket_accept.md)
