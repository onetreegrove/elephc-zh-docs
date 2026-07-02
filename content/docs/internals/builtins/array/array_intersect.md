---
title: "array_intersect() — 内部实现"
description: "array_intersect() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 14
---

## `array_intersect()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:885](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L885) (`lower_array_intersect`)
- **函数符号**: `lower_array_intersect()`


### Lowering 说明

- 针对两个具有指针大小有效载荷槽的兼容索引数组，对 `array_intersect()` 执行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_diff_key`
- `__rt_array_intersect`
- `__rt_array_intersect_key`
- `__rt_array_intersect_refcounted`

## 签名摘要

```php
function array_intersect(array $array, ...$arrays): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收恰好 1 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$arrays` 中。

## 交叉引用

- [`array_intersect()` 用户参考](../../../php/builtins/array/array_intersect.md)
