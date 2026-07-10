---
title: "deg2rad() — 内部实现"
description: "deg2rad() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 242
---

## `deg2rad()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/libm.rs`:75](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/libm.rs#L75) (`lower_deg2rad`)
- **函数符号**: `lower_deg2rad()`


### Lowering 说明

- 通过乘以 `PI / 180` 来对 `deg2rad()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function deg2rad(float $num): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`deg2rad()` 用户参考](../../../php/builtins/math/deg2rad.md)
