---
title: "acos() — 内部实现"
description: "acos() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 234
---

## `acos()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(未进行 lowering)`:0]()
- **函数符号**: `(无 —— 仅类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已被内联或路由至另一个内置函数。_

## 签名摘要

```php
function acos(float $num): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 仅接受 1 个参数。

## 交叉引用

- [`acos()` 用户参考手册](../../../php/builtins/math/acos.md)
