---
title: "class_exists() — 内部实现"
description: "class_exists() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 67
---

## `class_exists()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(未 lowering)`:0]()
- **函数符号**: `(无 — 仅限类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已被内联，或路由至其他内置函数（builtin）。_

## 签名摘要

```php
function class_exists(string $class, bool $autoload): bool
```

## 类型检查器强制执行的规则

- **参数个数（Arity）**: 接收 1–2 个参数（1 个可选）。

## 交叉引用

- [class_exists() 用户参考](../../../php/builtins/class/class_exists.md)
