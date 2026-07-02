---
title: "array_key_first() —— 内部实现"
description: "array_key_first() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 19
---

## `array_key_first()` —— 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:1155](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1155) (`lower_array_key_first`)
- **函数符号**：`lower_array_key_first()`


### Lowering 说明

- 通过选择器为 `0` 的共享 edge-key 辅助函数来对 `array_key_first()` 进行 lowering 处理。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_edge_key`
- `__rt_mixed_from_value`

## 签名摘要

```php
function array_key_first(array $array): mixed
```

## 类型检查器约束

- **参数数量 (Arity)**：恰好接受 1 个参数。

## 交叉引用

- [`array_key_first()` 的用户参考文档](../../../php/builtins/array/array_key_first.md)
