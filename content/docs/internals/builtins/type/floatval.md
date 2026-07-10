---
title: "floatval() — 内部实现"
description: "floatval() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 413
---

## `floatval()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1076](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1076) (`lower_floatval`)
- **函数符号**: `lower_floatval()`

### Lowering 说明

- 对具体标量操作数的 `floatval()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_str_to_number`

## 签名摘要

```php
function floatval(mixed $value): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`floatval()` 用户参考](../../../php/builtins/type/floatval.md)
