---
title: "array_walk() — 内部实现"
description: "array_walk() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 45
---

## `array_walk()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:783](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L783) (`lower_array_walk`)
- **函数符号**: `lower_array_walk()`


### Lowering 说明

- 通过回调驱动的运行时辅助函数对 `array_walk()` 执行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_walk`

## 签名摘要

```php
function array_walk(array $array, callable $callback, mixed $arg): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 3 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [`array_walk()` 用户参考文档](../../../php/builtins/array/array_walk.md)
