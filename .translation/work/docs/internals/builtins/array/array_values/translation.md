---
title: "array_values() — 内部实现"
description: "array_values() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 44
---

## `array_values()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays/values.rs`:22](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays/values.rs#L22) (`lower_array_values`)
- **函数符号**: `lower_array_values()`


### Lowering 说明

- 将 `array_values()` 进行 lowering：对于索引数组作为别名，对于关联数组则作为一个新的值数组。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 运行时辅助函数 —— lowering 过程已内联，或路由到了另一个内置函数。_

## 签名摘要

```php
function array_values(array $array): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`array_values()` 的用户参考](../../../php/builtins/array/array_values.md)
