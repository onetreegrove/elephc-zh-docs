---
title: "empty() — 内部实现"
description: "empty() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 277
---

## `empty()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1138](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1138) (`lower_empty`)
- **函数符号**: `lower_empty()`


### Lowering 说明

- 为具体的标量和类数组操作数进行 `empty()` 的 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_is_empty`

## 签名摘要

```php
function empty(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`empty()` 用户参考](../../../php/builtins/misc/empty.md)

