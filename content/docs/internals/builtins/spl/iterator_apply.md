---
title: "iterator_apply() — 内部实现"
description: "iterator_apply() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 319
---

## `iterator_apply()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:289](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L289) (`lower_iterator_apply`)
- **函数符号**: `lower_iterator_apply()`


### Lowering 说明

- 在受支持的 Traversable 来源和 callback 形式上对 `iterator_apply()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function iterator_apply(traversable $iterator, callable $callback, array $args): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–3 个参数（1 个可选参数）。

## 交叉引用

- [`iterator_apply()` 用户参考](../../../php/builtins/spl/iterator_apply.md)

