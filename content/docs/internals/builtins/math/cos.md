---
title: "cos() — 内部实现"
description: "cos() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 240
---

## `cos()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 函数签名摘要

```php
function cos(float $num): float
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`cos()` 用户参考](../../../php/builtins/math/cos.md)
