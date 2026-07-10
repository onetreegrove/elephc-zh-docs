---
title: "hypot() — 内部实现"
description: "hypot() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 247
---

## `hypot()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/libm.rs`:43](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/libm.rs#L43) (`lower_hypot`)
- **函数符号**: `lower_hypot()`


### Lowering 说明

- 使用 C ABI 的参数顺序 `x, y` 对 `hypot()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function hypot(float $x, float $y): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`hypot()` 用户参考](../../../php/builtins/math/hypot.md)
