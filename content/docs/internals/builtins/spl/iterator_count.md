---
title: "iterator_count() — 内部实现"
description: "iterator_count() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 320
---

## `iterator_count()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:236](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L236) (`lower_iterator_count`)
- **函数符号**: `lower_iterator_count()`


### Lowering 说明

- 在数组、`iterable` 和 Traversable 对象上对 `iterator_count()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function iterator_count(traversable $iterator): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`iterator_count()` 用户参考](../../../php/builtins/spl/iterator_count.md)

