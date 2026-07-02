---
title: "array_all() —— 内部实现"
description: "array_all() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 1
---

## `array_all()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1536](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1536) (`lower_array_all`)
- **函数符号**: `lower_array_all()`


### Lowering 说明

- 对 `array_all()` 执行 Lowering：当每个元素都满足谓词时返回 true。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_udiff_uintersect`
- `__rt_array_walk_recursive`

## 签名摘要

```php
function array_all(array $array, mixed $callback): mixed
```

## 类型检查器约束

- **Arity**: 恰好接受 2 个参数。

## 交叉引用

- [`array_all()` 用户参考](../../../php/builtins/array/array_all.md)
