---
title: "array_shift() — 内部实现"
description: "array_shift() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 36
---

## `array_shift()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays/shift.rs`:23](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays/shift.rs#L23) (`lower_array_shift`)
- **函数符号**: `lower_array_shift()`


### Lowering 说明

- 通过压缩槽位并将 `T|null` 装箱为 Mixed，实现索引数组的 `array_shift()` Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function array_shift(array $array): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [array_shift() 用户参考文档](../../../php/builtins/array/array_shift.md)
