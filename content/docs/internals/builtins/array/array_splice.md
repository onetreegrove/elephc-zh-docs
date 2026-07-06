---
title: "array_splice() — 内部实现"
description: "array_splice() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 38
---

## `array_splice()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:949](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L949) (`lower_array_splice`)
- **函数符号**: `lower_array_splice()`


### Lowering 说明

- 通过修改被索引的源数组并返回已移除的元素来实现 `array_splice()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已被内联或通过其他内置函数进行路由。_

## 签名摘要

```php
function array_splice(array $array, int $offset, int $length, array $replacement): array
```

## 类型检查器执行的约束

- **参数个数 (Arity)**: 接收 3–4 个参数（1 个可选）。
- **引用传递参数**: `$array`。

## 交叉引用

- [`array_splice()` 的用户参考手册](../../../php/builtins/array/array_splice.md)
