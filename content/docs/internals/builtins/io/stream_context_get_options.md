---
title: "stream_context_get_options() —— 内部实现"
description: "stream_context_get_options() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 191
---

## `stream_context_get_options()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1252](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1252) (`lower_stream_context_get_options`)
- **函数符号**: `lower_stream_context_get_options()`


### Lowering 说明

- 降级 `stream_context_get_options(context)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_new`
- `__rt_incref`

## 签名摘要

```php
function stream_context_get_options(resource $stream_or_context): array
```

## 类型检查器约束

- **Arity**: 恰好接受 1 个参数。

## 交叉引用

- [`stream_context_get_options()` 的用户参考](../../../php/builtins/io/stream_context_get_options.md)
