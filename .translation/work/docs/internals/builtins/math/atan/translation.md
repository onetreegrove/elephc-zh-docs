---
title: "atan() — 内部实现"
description: "atan() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 236
---

## `atan()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个 builtin。_

## 签名摘要

```php
function atan(float $num): float
```

## 类型检查器约束

- **参数数量 (Arity)**: 仅接受 1 个参数。

## 交叉引用

- [`atan()` 用户参考](../../../php/builtins/math/atan.md)
