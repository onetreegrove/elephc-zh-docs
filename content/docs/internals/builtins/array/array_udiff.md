---
title: "array_udiff() — 内部实现"
description: "array_udiff() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 40
---

## `array_udiff()` — 内部实现

## 实现位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1658](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1658) (`lower_array_udiff`)
- **函数符号**: `lower_array_udiff()`


### Lowering 说明

- Lowering `array_udiff()`：保留第一个数组中与第二个数组的任何元素都不相等（根据比较器判定）的元素。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程已被内联，或者路由到了另一个内置函数。_

## 签名摘要

```php
function array_udiff(array $array1, array $array2, callable $callback): mixed
```

## 类型检查器约束

- **参数数量 (Arity)**：恰好接受 3 个参数。

## 交叉引用

- [`array_udiff()` 用户参考](../../../php/builtins/array/array_udiff.md)
