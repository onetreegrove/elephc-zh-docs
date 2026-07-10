---
title: "stream_set_chunk_size() —— 内部实现"
description: "stream_set_chunk_size() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 210
---

## `stream_set_chunk_size()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2194](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2194) (`lower_stream_set_chunk_size`)
- **函数符号**: `lower_stream_set_chunk_size()`


### Lowering 说明

- 对 `stream_set_chunk_size(stream, size)` 进行 Lowering 并返回先前的大小。

## 运行时辅助函数

_未捕获到直接的 __rt_* 辅助函数 —— Lowering 是内联的，或者路由到另一个 Builtin。_

## 签名摘要

```php
function stream_set_chunk_size(resource $stream, int $size): int
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`stream_set_chunk_size()` 用户参考](../../../php/builtins/io/stream_set_chunk_size.md)
