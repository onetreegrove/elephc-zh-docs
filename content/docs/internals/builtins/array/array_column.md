---
title: "array_column() — 内部实现"
description: "array_column() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 4
---

## `array_column()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays/column.rs`:23](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays/column.rs#L23) (`lower_array_column`)
- **函数符号**: `lower_array_column()`


### Lowering 说明

- 通过分发到与行值所有权相匹配的辅助函数，来对 `array_column()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 __rt_* 辅助函数 —— lowering 是内联的，或者通过其他内建函数进行路由。_

## 签名摘要

```php
function array_column(array $array, string $column_key, string $index_key): array
```

## 类型检查器约束

- **参数个数**: 接收且仅接收 3 个参数。

## 交叉引用

- [`array_column()` 用户参考](../../../php/builtins/array/array_column.md)
