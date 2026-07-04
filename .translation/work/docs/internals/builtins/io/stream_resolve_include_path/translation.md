---
title: "stream_resolve_include_path() — 内部实现"
description: "stream_resolve_include_path() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 207
---

## `stream_resolve_include_path()` —— 内部实现

## 实现位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:2361](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2361) (`lower_stream_resolve_include_path`)
- **函数符号**：`lower_stream_resolve_include_path()`


### Lowering 说明

- 将 `stream_resolve_include_path(filename)` lowering 为基于 realpath 的 `string|false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_realpath`
- `__rt_stream_socket_server`

## 签名摘要

```php
function stream_resolve_include_path(string $filename): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`stream_resolve_include_path()` 的用户参考文档](../../../php/builtins/io/stream_resolve_include_path.md)
