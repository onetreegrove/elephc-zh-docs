---
title: "stream_filter_register() — 内部实现"
description: "stream_filter_register() 的编译器内部实现：降级路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 197
---

## `stream_filter_register()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **降级**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1521](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1521) (`lower_stream_filter_register`)
- **函数符号**: `lower_stream_filter_register()`

### 降级说明

- 将 `stream_filter_register(filter_name, class)` 降级为用户过滤器注册辅助函数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_filter_register`

## 签名摘要

```php
function stream_filter_register(string $filter_name, string $class): bool
```

## 类型检查器约束

- **参数个数**: 恰好接受 2 个参数。

## 交叉引用

- [`stream_filter_register()` 的用户参考文档](../../../php/builtins/io/stream_filter_register.md)
