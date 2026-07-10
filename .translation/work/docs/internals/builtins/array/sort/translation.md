---
title: "sort() — 内部实现"
description: "sort() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 58
---

## `sort()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1076](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1076) (`lower_sort`)
- **函数符号**: `lower_sort()`


### Lowering 说明

- 通过就地（in-place）修改源数组，对索引整数数组的 `sort()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_arsort`
- `__rt_asort`
- `__rt_krsort`
- `__rt_ksort`
- `__rt_rsort_int`
- `__rt_rsort_str`
- `__rt_sort_int`
- `__rt_sort_str`

## 签名摘要

```php
function sort(array $array, int $flags): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接收 2 个参数。
- **引用参数**: `$array`。

## 交叉引用

- [`sort()` 用户参考](../../../php/builtins/array/sort.md)
