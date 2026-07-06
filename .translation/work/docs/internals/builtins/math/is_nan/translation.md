---
title: "is_nan() — 内部实现"
description: "is_nan() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 251
---

## `is_nan()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:113](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L113) (`lower_is_nan`)
- **函数符号**: `lower_is_nan()`


### Lowering 说明

- 通过检查规范化后的浮点数是否与自身 unordered，来对 `is_nan()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_nan(float $num): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_nan()` 用户参考](../../../php/builtins/math/is_nan.md)

