---
title: "intval() — 内部实现"
description: "intval() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 417
---

## `intval()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1043](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1043) (`lower_intval`)
- **函数符号**: `lower_intval()`

### Lowering 说明

- 对具体标量操作数的 `intval()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_cast_int`
- `__rt_str_to_int`

## 签名摘要

```php
function intval(mixed $value, int $base): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`intval()` 用户参考](../../../php/builtins/type/intval.md)
