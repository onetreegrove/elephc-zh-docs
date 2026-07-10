---
title: "stream_socket_sendto() — 内部实现"
description: "stream_socket_sendto() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 220
---

## `stream_socket_sendto()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:2641](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2641) (`lower_stream_socket_sendto`)
- **函数符号**：`lower_stream_socket_sendto()`


### Lowering 说明

- Lowering `stream_socket_sendto(socket, data, flags?, address?)` 并对 `int|false` 进行装箱（box）。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数——Lowering 已被内联，或通过其他内置函数进行路由。_

## 签名摘要

```php
function stream_socket_sendto(resource $socket, string $data, int $flags, string $address): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 2–4 个参数（其中 2 个可选）。

## 交叉引用

- [stream_socket_sendto() 用户参考](../../../php/builtins/io/stream_socket_sendto.md)
