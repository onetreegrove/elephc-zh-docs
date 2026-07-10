---
title: "stream_socket_recvfrom() — 内部实现"
description: "stream_socket_recvfrom() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 219
---

## `stream_socket_recvfrom()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2599](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2599) (`lower_stream_socket_recvfrom`)
- **函数符号**: `lower_stream_socket_recvfrom()`


### Lowering 说明

- 对 `stream_socket_recvfrom(socket, length, flags?, address?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数——其 lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function stream_socket_recvfrom(resource $socket, int $length, int $flags, string $address): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–4 个参数（2 个可选）。
- **引用参数**: `$address`。

## 交叉引用

- [`stream_socket_recvfrom()` 的用户参考](../../../php/builtins/io/stream_socket_recvfrom.md)
