---
title: "is_numeric() — 内部实现"
description: "is_numeric() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 425
---

## `is_numeric()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/is_numeric.rs`:22](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/is_numeric.rs#L22) (`lower_is_numeric`)
- **函数符号**: `lower_is_numeric()`

### Lowering 说明

- 对具体标量值的 `is_numeric()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_numeric(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_numeric()` 用户参考](../../../php/builtins/type/is_numeric.md)
