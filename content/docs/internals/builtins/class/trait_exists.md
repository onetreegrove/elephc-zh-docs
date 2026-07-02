---
title: "trait_exists() — 内部实现"
description: "trait_exists() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 82
---

## `trait_exists()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(无 — 仅限类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 被内联或路由至另一个内置函数。_

## 签名摘要

```php
function trait_exists(string $trait, bool $autoload): bool
```

## 类型检查器约束

- **参数数量**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`trait_exists()` 用户参考](../../../php/builtins/class/trait_exists.md)
