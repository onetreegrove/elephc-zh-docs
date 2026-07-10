---
title: "get_parent_class() — 内部实现"
description: "get_parent_class() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 78
---

## `get_parent_class()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(未进行 lowering)`:0]()
- **函数符号**: `(无 — 仅类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 — lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function get_parent_class(mixed $object_or_class): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 0–1 个参数（1 个可选）。

## 交叉引用

- [`get_parent_class()` 用户参考](../../../php/builtins/class/get_parent_class.md)
