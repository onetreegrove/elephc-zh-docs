---
title: "round() — 内部实现"
description: "round() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 263
---

## `round()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:186](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L186) (`lower_round`)
- **函数符号**: `lower_round()`


### Lowering 说明

- 为具体的类整型和浮点型操作数进行 `round()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function round(float $num, int $precision): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`round()` 用户参考](../../../php/builtins/math/round.md)

