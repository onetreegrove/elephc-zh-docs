---
title: "array_unshift() — internals"
description: "array_unshift() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 43
---

## `array_unshift()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays/unshift.rs`:23](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays/unshift.rs#L23) (`lower_array_unshift`)
- **函数符号**: `lower_array_unshift()`


### Lowering 说明

- 通过确保唯一性、在开头添加一个标量值并返回计数来 lower `array_unshift()`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 — Lowering 是内联的，或者路由通过另一个 builtin。_

## 签名摘要

```php
function array_unshift(array $array, ...$values): int
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 恰好接受 1 个参数。
- **引用传递参数**: `$array`。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$values` 中。

## 交叉引用

- [`array_unshift()` 的用户参考](../../../php/builtins/array/array_unshift.md)
