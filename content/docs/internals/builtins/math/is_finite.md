---
title: "is_finite() — 内部实现"
description: "is_finite() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 249
---

## `is_finite()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:169](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L169) (`lower_is_finite`)
- **函数符号**: `lower_is_finite()`


### Lowering 说明

- 通过拒绝 NaN 以及正负无穷来对 `is_finite()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_finite(float $num): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_finite()` 用户参考](../../../php/builtins/math/is_finite.md)

