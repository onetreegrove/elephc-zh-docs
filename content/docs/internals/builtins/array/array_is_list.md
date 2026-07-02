---
title: "array_is_list() — 内部实现"
description: "array_is_list() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 17
---

## `array_is_list()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1144](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1144) (`lower_array_is_list`)
- **函数符号**: `lower_array_is_list()`


### Lowering 说明

- 将 `array_is_list()` 降级为 `__rt_array_is_list` 运行时谓词，返回 bool。
- 该运行时辅助函数接受任何数组类别（索引型、关联哈希或装箱的 mixed 单元）并
- 在键是按插入顺序排列的连续整数 `0..n-1` 时返回 `1`，否则返回 `0`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_edge_key`
- `__rt_array_is_list`
- `__rt_mixed_from_value`

## 签名摘要

```php
function array_is_list(mixed $array): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`array_is_list()` 用户参考](../../../php/builtins/array/array_is_list.md)
