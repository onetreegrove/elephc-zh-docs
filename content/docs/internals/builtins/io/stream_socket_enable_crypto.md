---
title: "stream_socket_enable_crypto() —— 内部实现"
description: "stream_socket_enable_crypto() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 216
---

## `stream_socket_enable_crypto()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2547](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2547) (`lower_stream_socket_enable_crypto`)
- **函数符号**: `lower_stream_socket_enable_crypto()`


### Lowering 说明

- 对 `stream_socket_enable_crypto(stream, enable, method?, session_stream?)` 进行 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个内置函数（builtin）。_

## 签名摘要

```php
function stream_socket_enable_crypto(resource $stream, bool $enable, int $crypto_method, resource $session_stream): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 接受 2–4 个参数（其中 2 个可选）。

## 交叉引用

- [`stream_socket_enable_crypto()` 用户参考](../../../php/builtins/io/stream_socket_enable_crypto.md)
