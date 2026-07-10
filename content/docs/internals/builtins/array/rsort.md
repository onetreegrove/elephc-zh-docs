---
title: "rsort() — 内部实现"
description: "rsort() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 56
---

## `rsort()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1081](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1081) (`lower_rsort`)
- **函数符号**: `lower_rsort()`


### Lowering 说明

- 通过原地修改源数组，对索引整型数组的 `rsort()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_arsort`
- `__rt_asort`
- `__rt_krsort`
- `__rt_ksort`
- `__rt_natsort`
- `__rt_rsort_int`
- `__rt_rsort_str`

## 签名摘要

```php
function rsort(array $array, int $flags): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接收 2 个参数。
- **引用传递参数**: `$array`。

## 交叉引用

- [`rsort()` 的用户参考文档](../../../php/builtins/array/rsort.md)
