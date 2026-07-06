---
title: "boolval() — 内部实现"
description: "boolval() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 408
---

## `boolval()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1106](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1106) (`lower_boolval`)
- **函数符号**: `lower_boolval()`

### Lowering 说明

- 使用与 `IsTruthy` 相同的具体标量 PHP truthiness 规则对 `boolval()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function boolval(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`boolval()` 用户参考](../../../php/builtins/type/boolval.md)
