---
title: "array_push() — 内部实现"
description: "array_push() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 29
---

## `array_push()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:61](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L61) (`lower_array_push`)
- **函数符号**: `lower_array_push()`


### Lowering 说明

- 通过追加一个值并发布修改后的数组来对 `array_push()` 进行 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function array_push(array $array, ...$values): void
```

## 类型检查器约束

- **参数数量 (Arity)**: 正好接受 1 个参数。
- **引用传递参数**: `$array`。
- **可变参数**: 将多余的参数收集到 `$values` 中。

## 交叉引用

- [`array_push()` 用户参考](../../../php/builtins/array/array_push.md)
