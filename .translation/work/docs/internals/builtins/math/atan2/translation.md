---
title: "atan2() — 内部实现"
description: "atan2() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 237
---

## `atan2()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/libm.rs`:35](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/libm.rs#L35) (`lower_atan2`)
- **函数符号**: `lower_atan2()`


### Lowering 说明

- 使用 C ABI 参数顺序 `y, x` 进行 `atan2()` 的 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个 builtin。_

## 签名摘要

```php
function atan2(float $y, float $x): float
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`atan2()` 用户参考](../../../php/builtins/math/atan2.md)
