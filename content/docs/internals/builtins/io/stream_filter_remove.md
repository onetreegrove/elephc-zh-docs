---
title: "stream_filter_remove() — 内部实现"
description: "stream_filter_remove() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 198
---

## `stream_filter_remove()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1939](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1939) (`lower_stream_filter_remove`)
- **函数符号**: `lower_stream_filter_remove()`


### Lowering 说明

- 降低 `stream_filter_remove(filter)` 并清除该 fd 双向的过滤表。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_user_filter_release_fd`

## 函数签名摘要

```php
function stream_filter_remove(resource $stream_filter): bool
```

## 类型检查器强制约束

- **参数个数**: 必须正好接受 1 个参数。

## 交叉引用

- [`stream_filter_remove()` 的用户参考](../../../php/builtins/io/stream_filter_remove.md)
