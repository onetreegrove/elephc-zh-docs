---
title: "is_array() — 内部实现"
description: "is_array() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 418
---

## `is_array()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1522](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1522) (`lower_is_array`)
- **函数符号**: `lower_is_array()`

### Lowering 说明

- 对 `is_array()` 进行 lowering：对于静态已知的数组/hash，或运行时标签为索引数组 (4) 或关联数组 (5) 的装箱 Mixed/Union 值，结果为 true。
- `iterable` 类型的值在这里不会被视为确定的数组（它可能持有 Traversable）；这种情况应使用 `is_iterable`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_array(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_array()` 用户参考](../../../php/builtins/type/is_array.md)
