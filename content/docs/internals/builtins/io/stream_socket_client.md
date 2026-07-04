---
title: "stream_socket_client() — 内部实现"
description: "stream_socket_client() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 215
---

## `stream_socket_client()` — 内部实现

## 实现位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2397](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2397) (`lower_stream_socket_client`)
- **函数符号**: `lower_stream_socket_client()`


### Lowering 说明

- 将 `stream_socket_client(address)` 进行 lowering，并记录已连接的主机以用于默认的 TLS 配置。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stash_connect_host`
- `__rt_stream_socket_client`

## 签名摘要

```php
function stream_socket_client(string $address, int $error_code, int $error_message, string $timeout, float $flags): mixed
```

## 类型检查器约束

- **参数数量**: 正好接受 5 个参数。
- **引用参数**: `$error_code`, `$error_message`。

## 交叉引用

- [`stream_socket_client()` 用户参考文档](../../../php/builtins/io/stream_socket_client.md)
