---
title: "array_reduce() — 内部实现"
description: "array_reduce() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 31
---

## `array_reduce()` — 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:701](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L701) (`lower_array_reduce`)
- **函数符号**：`lower_array_reduce()`


### Lowering 说明

- 通过回调驱动的运行时辅助函数来 lower `array_reduce()`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_reduce`

## 签名摘要

```php
function array_reduce(array $array, callable $callback, mixed $initial): int
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 2–3 个参数（1 个可选）。

## 交叉引用

- [`array_reduce()` 用户参考](../../../php/builtins/array/array_reduce.md)
