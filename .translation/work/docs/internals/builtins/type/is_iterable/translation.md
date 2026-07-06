---
title: "is_iterable() — 内部实现"
description: "is_iterable() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 423
---

## `is_iterable()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1314](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1314) (`lower_is_iterable`)
- **函数符号**: `lower_is_iterable()`

### Lowering 说明

- 对具体值和装箱 Mixed 载荷的 `is_iterable()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_iterable(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_iterable()` 用户参考](../../../php/builtins/type/is_iterable.md)
