---
title: "log() — 内部实现"
description: "log() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 252
---

## `log()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/libm.rs`:51](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/libm.rs#L51) (`lower_log`)
- **函数符号**: `lower_log()`


### Lowering 说明

- 对单参数形式以及带底数变换的双参数形式进行 `log()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function log(float $num, float $base): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`log()` 用户参考](../../../php/builtins/math/log.md)

