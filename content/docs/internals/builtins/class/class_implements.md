---
title: "class_implements() — 内部实现"
description: "class_implements() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 69
---

## `class_implements()` — 内部实现

## 所在位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`(未 lowering)`:0]()
- **函数符号**：`(无 — 仅类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已内联或路由至另一个内置函数。_

## 签名摘要

```php
function class_implements(mixed $object_or_class, bool $autoload): mixed
```

## 类型检查器约束

- **参数个数**：接收 1–2 个参数（1 个可选）。

## 交叉引用

- [`class_implements()` 用户参考](../../../php/builtins/class/class_implements.md)
