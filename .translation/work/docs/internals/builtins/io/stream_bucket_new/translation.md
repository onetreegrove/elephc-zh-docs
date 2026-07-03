---
title: "stream_bucket_new() — 内部实现"
description: "stream_bucket_new() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助程序。"
sidebar:
  order: 188
---

## `stream_bucket_new()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1970](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1970) (`lower_stream_bucket_new`)
- **函数符号**: `lower_stream_bucket_new()`


### Lowering 说明

- 将 `stream_bucket_new(stream, data)` lowering 为一个基于 stdClass 的 bucket 对象。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 已被内联，或路由到了另一个 builtin。_

## 签名摘要

```php
function stream_bucket_new(resource $stream, string $buffer): mixed
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`stream_bucket_new()` 的用户参考](../../../php/builtins/io/stream_bucket_new.md)
