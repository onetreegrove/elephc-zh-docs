---
title: "array_find() — 内部实现"
description: "array_find() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 12
---

## `array_find()` — 内部实现

## 代码位置

- **签名 (Signature)**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1526](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1526) (`lower_array_find`)
- **函数符号**: `lower_array_find()`


### Lowering 说明

- Lowering `array_find()`：返回满足谓词的第一个元素，装箱为 Mixed（或 null）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_walk_recursive`

## 签名摘要

```php
function array_find(array $array, mixed $callback): mixed
```

## 类型检查器强制约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`array_find()` 用户参考](../../../php/builtins/array/array_find.md)
