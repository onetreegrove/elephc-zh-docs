---
title: "arsort() — 内部实现"
description: "arsort() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 47
---

## `arsort()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1091](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1091) (`lower_arsort`)
- **函数符号**: `lower_arsort()`


### Lowering 说明

- 通过降序值排序包装器，对整型索引数组的 `arsort()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_arsort`
- `__rt_krsort`
- `__rt_ksort`
- `__rt_natcasesort`
- `__rt_natsort`

## 签名摘要

```php
function arsort(array $array, int $flags): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。
- **引用传递参数**: `$array`。

## 交叉引用

- [`arsort()` 用户参考](../../../php/builtins/array/arsort.md)
