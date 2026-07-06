---
title: "rad2deg() — 内部实现"
description: "rad2deg() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 260
---

## `rad2deg()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/libm.rs`:83](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/libm.rs#L83) (`lower_rad2deg`)
- **函数符号**: `lower_rad2deg()`


### Lowering 说明

- 通过乘以 `180 / PI` 来对 `rad2deg()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function rad2deg(float $num): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`rad2deg()` 用户参考](../../../php/builtins/math/rad2deg.md)

