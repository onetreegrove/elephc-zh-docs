---
title: "array_key_last() — 内部实现"
description: "array_key_last() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 20
---

## `array_key_last()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1160](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1160) (`lower_array_key_last`)
- **函数符号**: `lower_array_key_last()`


### Lowering 说明

- 通过选择器为 `1` 的共享 edge-key 辅助函数对 `array_key_last()` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_edge_key`
- `__rt_mixed_from_value`

## 签名摘要

```php
function array_key_last(array $array): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 1 个参数。

## 交叉引用

- [`array_key_last()` 的用户参考文档](../../../php/builtins/array/array_key_last.md)
