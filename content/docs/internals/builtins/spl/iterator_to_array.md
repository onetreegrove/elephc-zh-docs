---
title: "iterator_to_array() — 内部实现"
description: "iterator_to_array() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 321
---

## `iterator_to_array()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:265](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L265) (`lower_iterator_to_array`)
- **函数符号**: `lower_iterator_to_array()`


### Lowering 说明

- 在数组、`iterable` 和 Traversable 对象上对 `iterator_to_array()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function iterator_to_array(traversable $iterator, bool $preserve_keys): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`iterator_to_array()` 用户参考](../../../php/builtins/spl/iterator_to_array.md)

