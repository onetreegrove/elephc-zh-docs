---
title: "array_merge_recursive() — 内部实现"
description: "array_merge_recursive() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 24
---

## `array_merge_recursive()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1366](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1366) (`lower_array_merge_recursive`)
- **函数符号**: `lower_array_merge_recursive()`


### Lowering 说明

- 对 `array_merge_recursive()` 进行 lowering（递归合并，其中标量冲突将被合并为列表）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_find_any_all`
- `__rt_array_merge_recursive`
- `__rt_array_udiff_uintersect`

## 签名摘要

```php
function array_merge_recursive(...$arrays): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接受参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$arrays` 中。

## 交叉引用

- [`array_merge_recursive()` 的用户参考](../../../php/builtins/array/array_merge_recursive.md)
