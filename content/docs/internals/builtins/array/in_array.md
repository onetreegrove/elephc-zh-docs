---
title: "in_array() — 内部实现"
description: "in_array() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 50
---

## `in_array()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1729](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1729) (`lower_in_array`)
- **函数符号**: `lower_in_array()`


### Lowering 说明

- 针对具有标量或字符串 payload 的索引数组 lower `in_array()`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 被内联，或者通过另一个 builtin 路由。_

## 签名摘要

```php
function in_array(mixed $needle, array $haystack, bool $strict): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 2–3 个参数（1 个可选）。

## 交叉引用

- [`in_array()` 用户参考](../../../php/builtins/array/in_array.md)
