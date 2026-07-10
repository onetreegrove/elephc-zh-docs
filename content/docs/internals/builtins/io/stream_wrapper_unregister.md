---
title: "stream_wrapper_unregister() —— 内部实现"
description: "stream_wrapper_unregister() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 226
---

## `stream_wrapper_unregister()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1030](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1030) (`lower_stream_wrapper_unregister`)
- **函数符号**: `lower_stream_wrapper_unregister()`


### Lowering 说明

- 对 `stream_wrapper_unregister(protocol)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_wrapper_unregister`

## 签名摘要

```php
function stream_wrapper_unregister(string $protocol): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`stream_wrapper_unregister()` 用户参考](../../../php/builtins/io/stream_wrapper_unregister.md)
