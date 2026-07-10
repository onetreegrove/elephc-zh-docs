---
title: "stream_get_wrappers() — 内部实现"
description: "stream_get_wrappers() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 204
---

## `stream_get_wrappers()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1461](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1461) (`lower_stream_get_wrappers`)
- **函数符号**: `lower_stream_get_wrappers()`


### Lowering 说明

- 将 `stream_get_wrappers()` lowering 为静态内置包装器（wrapper）列表。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者通过其他内置函数进行路由。_

## 签名摘要

```php
function stream_get_wrappers(): array
```

## 类型检查器检查项

- **参数个数**: 不接受任何参数。

## 交叉引用

- [`stream_get_wrappers()` 的用户参考](../../../php/builtins/io/stream_get_wrappers.md)
