---
title: "stream_set_blocking() —— 内部实现"
description: "stream_set_blocking() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 209
---

## `stream_set_blocking()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2142](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2142) (`lower_stream_set_blocking`)
- **函数符号**: `lower_stream_set_blocking()`


### Lowering 说明

- 对 `stream_set_blocking(stream, enable)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_set_blocking`
- `__rt_user_wrapper_set_option`

## 签名摘要

```php
function stream_set_blocking(resource $stream, bool $enable): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`stream_set_blocking()` 用户参考](../../../php/builtins/io/stream_set_blocking.md)
