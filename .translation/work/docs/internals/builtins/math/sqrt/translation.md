---
title: "sqrt() — 内部实现"
description: "sqrt() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 266
---

## `sqrt()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:97](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L97) (`lower_sqrt`)
- **函数符号**: `lower_sqrt()`


### Lowering 说明

- 为具体的类整型和浮点型操作数进行 `sqrt()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function sqrt(float $num): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`sqrt()` 用户参考](../../../php/builtins/math/sqrt.md)

