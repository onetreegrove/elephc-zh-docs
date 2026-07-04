---
title: "stream_socket_pair() — 内部实现"
description: "stream_socket_pair() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 218
---

## `stream_socket_pair()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2465](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2465) (`lower_stream_socket_pair`)
- **函数符号**: `lower_stream_socket_pair()`


### Lowering 说明

- 对 `stream_socket_pair(domain, type, protocol)` 进行 lowering，并对 `array|false` 进行装箱。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_socket_pair`

## 签名摘要

```php
function stream_socket_pair(int $domain, int $type, int $protocol): mixed
```

## 类型检查器约束

- **参数数量（Arity）**: 恰好接受 3 个参数。

## 交叉引用

- [`stream_socket_pair()` 的用户参考](../../../php/builtins/io/stream_socket_pair.md)
