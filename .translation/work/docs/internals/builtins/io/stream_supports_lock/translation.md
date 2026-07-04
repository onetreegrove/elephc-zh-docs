---
title: "stream_supports_lock() —— 内部实现"
description: "stream_supports_lock() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 223
---

## `stream_supports_lock()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2115](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2115) (`lower_stream_supports_lock`)
- **函数符号**: `lower_stream_supports_lock()`


### Lowering 说明

- 在资源解包（resource unboxing）后，对 `stream_supports_lock(stream)` 进行 Lowering 并返回 true。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_isatty`

## 签名摘要

```php
function stream_supports_lock(resource $stream): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`stream_supports_lock()` 用户参考](../../../php/builtins/io/stream_supports_lock.md)
