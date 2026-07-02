---
title: "array_walk_recursive() — 内部实现"
description: "array_walk_recursive() 的编译器内部实现：lowering 路径、类型检查及运行时辅助函数。"
sidebar:
  order: 46
---

## `array_walk_recursive()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1542](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1542) (`lower_array_walk_recursive`)
- **函数符号**: `lower_array_walk_recursive()`


### Lowering 说明

- Lowering `array_walk_recursive()`：对（可能嵌套的）数组的每个标量叶子节点调用回调函数，
- 深入到数组类型的元素中。返回 void；叶子节点作为 8 字节标量传递。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_udiff_uintersect`
- `__rt_array_walk_recursive`

## 签名摘要

```php
function array_walk_recursive(array $array, callable $callback, mixed $value): void
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 恰好接收 3 个参数。
- **引用参数**: `$array`。

## 交叉引用

- [`array_walk_recursive()` 的用户参考](../../../php/builtins/array/array_walk_recursive.md)
