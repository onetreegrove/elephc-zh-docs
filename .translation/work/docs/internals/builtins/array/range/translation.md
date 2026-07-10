---
title: "range() — 内部实现"
description: "range() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 55
---

## `range()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:1020](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1020) (`lower_range`)
- **函数符号**：`lower_range()`


### Lowering 说明

- 通过共享的运行时构造函数对整数端点的 `range()` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_cast_int`
- `__rt_range`

## 签名摘要

```php
function range(mixed $start, mixed $end, int $step): array
```

## 类型检查器约束

- **参数数量 (Arity)**：接收且仅接收 3 个参数。

## 交叉引用

- [`range()` 用户参考](../../../php/builtins/array/range.md)
