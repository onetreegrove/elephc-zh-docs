---
title: "asort() — 内部实现"
description: "asort() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 48
---

## `asort()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1086](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1086) (`lower_asort`)
- **函数符号**: `lower_asort()`


### Lowering 备注

- 通过值排序运行时包装器降级（lower）针对索引整型数组的 `asort()`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_arsort`
- `__rt_asort`
- `__rt_krsort`
- `__rt_ksort`
- `__rt_natcasesort`
- `__rt_natsort`

## 签名摘要

```php
function asort(array $array, int $flags): bool
```

## 类型检查器约束

- **参数个数（Arity）**: 必须传入 2 个参数。
- **传引用参数**: `$array`。

## 交叉引用

- [`asort()` 用户参考](../../../php/builtins/array/asort.md)
