---
title: "stream_bucket_make_writeable() —— 内部实现"
description: "stream_bucket_make_writeable() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 187
---

## `stream_bucket_make_writeable()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1987](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1987) (`lower_stream_bucket_make_writeable`)
- **函数符号**: `lower_stream_bucket_make_writeable()`


### Lowering 说明

- 通过弹出 brigade 头部来对 `stream_bucket_make_writeable(brigade)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stdclass_get`

## 签名摘要

```php
function stream_bucket_make_writeable(mixed $brigade): mixed
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`stream_bucket_make_writeable()` 用户参考文档](../../../php/builtins/io/stream_bucket_make_writeable.md)
