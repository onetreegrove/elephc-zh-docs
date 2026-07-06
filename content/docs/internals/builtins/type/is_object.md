---
title: "is_object() — 内部实现"
description: "is_object() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 426
---

## `is_object()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1537](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1537) (`lower_is_object`)
- **函数符号**: `lower_is_object()`

### Lowering 说明

- 对 `is_object()` 进行 lowering：对于静态已知的对象，或运行时标签为对象 (6) 的装箱 Mixed/Union 值，结果为 true。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_object(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_object()` 用户参考](../../../php/builtins/type/is_object.md)
