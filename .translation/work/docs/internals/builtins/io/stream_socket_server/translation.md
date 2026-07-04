---
title: "stream_socket_server() — 内部实现"
description: "stream_socket_server() 的编译器内部实现：lowering 路径、类型检查和运行时助手。"
sidebar:
  order: 221
---

## `stream_socket_server()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2374](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2374) (`lower_stream_socket_server`)
- **函数符号**: `lower_stream_socket_server()`


### Lowering 备注

- 对 `stream_socket_server(address)` 进行 lowering 并装箱 `resource|false`。

## 运行时助手

引用了以下运行时助手：
- `__rt_stream_socket_server`

## 签名摘要

```php
function stream_socket_server(string $address, int $error_code, int $error_message): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接收 3 个参数。
- **引用参数**：`$error_code`、`$error_message`。

## 交叉引用

- [stream_socket_server() 的用户参考](../../../php/builtins/io/stream_socket_server.md)
