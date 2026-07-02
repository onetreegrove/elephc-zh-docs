---
title: "array_intersect_assoc() — 内部实现"
description: "array_intersect_assoc() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 15
---

## `array_intersect_assoc()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1352](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1352) (`lower_array_intersect_assoc`)
- **函数符号**: `lower_array_intersect_assoc()`


### Lowering 说明

- 通过共享的关联 diff/intersect 辅助函数（模式 1 = intersect）对 `array_intersect_assoc()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_find_any_all`
- `__rt_array_merge_recursive`
- `__rt_array_udiff_uintersect`
- `__rt_assoc_diff_intersect`

## 签名摘要

```php
function array_intersect_assoc(array $array, ...$arrays): mixed
```

## 类型检查器约束

- **参数个数（Arity）**: 恰好接受 1 个参数。
- **可变参数（Variadic）**: 将多余的参数收集到 `$arrays` 中。

## 交叉引用

- [`array_intersect_assoc()` 的用户参考](../../../php/builtins/array/array_intersect_assoc.md)
