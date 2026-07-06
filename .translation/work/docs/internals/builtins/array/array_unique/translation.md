---
title: "array_unique() —— 内部实现"
description: "array_unique() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 42
---

## `array_unique()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:198](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L198) (`lower_array_unique`)
- **函数符号**: `lower_array_unique()`


### Lowering 说明

- 对具有 8 字节有效负载槽（payload slots）的索引数组执行 `array_unique()` Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_filter`
- `__rt_array_filter_refcounted`

## 签名摘要

```php
function array_unique(array $array, int $flags): array
```

## 类型检查器约束

- **Arity**: 恰好接受 2 个参数。

## 交叉引用

- [`array_unique()` 用户参考](../../../php/builtins/array/array_unique.md)
