---
title: "array_filter() — 内部实现"
description: "array_filter() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 11
---

## `array_filter()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:211](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L211) (`lower_array_filter`)
- **函数符号**: `lower_array_filter()`


### Lowering 说明

- 通过运行时辅助函数对静态和一等回调（first-class callback）的 `array_filter()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_filter`
- `__rt_array_filter_refcounted`

## 签名摘要

```php
function array_filter(array $array, callable $callback, int $mode): array
```

## 类型检查器约束

- **参数个数（Arity）**: 接收 1–3 个参数（其中 2 个可选）。

## 交叉引用

- [`array_filter()` 的用户参考](../../../php/builtins/array/array_filter.md)
