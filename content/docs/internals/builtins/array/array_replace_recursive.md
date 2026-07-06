---
title: "array_replace_recursive() — 内部实现"
description: "array_replace_recursive() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 33
---

## `array_replace_recursive()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1333](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1333) (`lower_array_replace_recursive`)
- **函数符号**: `lower_array_replace_recursive()`


### Lowering 说明

- 对 `array_replace_recursive()` 进行 lowering（递归的右侧覆盖哈希合并）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_replace_recursive`
- `__rt_assoc_diff_intersect`

## 签名摘要

```php
function array_replace_recursive(array $array, array $replacements): mixed
```

## 类型检查器约束

- **Arity**: 恰好接受 2 个参数。

## 交叉引用

- [`array_replace_recursive()` 用户参考](../../../php/builtins/array/array_replace_recursive.md)
