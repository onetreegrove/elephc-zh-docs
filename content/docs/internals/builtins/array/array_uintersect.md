---
title: "array_uintersect() — 内部实现"
description: "array_uintersect() 的编译器内部实现：Lowering 路径、类型检查和运行时助手函数。"
sidebar:
  order: 41
---

## `array_uintersect()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1663](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1663) (`lower_array_uintersect`)
- **函数符号**: `lower_array_uintersect()`


### Lowering 说明

- 对 `array_uintersect()` 执行 Lowering：保留第一个数组中与第二个数组的某些元素（根据比较器）相等的元素。

## 运行时助手

_未捕获到直接的 `__rt_*` 运行时助手函数——其 Lowering 过程已内联，或路由至其他内置函数。_

## 函数签名摘要

```php
function array_uintersect(array $array1, array $array2, callable $callback): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接收 3 个参数。

## 交叉引用

- [`array_uintersect()` 用户参考文档](../../../php/builtins/array/array_uintersect.md)
