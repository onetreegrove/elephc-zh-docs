---
title: "enum_exists() — internals"
description: "enum_exists() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 72
---

## `enum_exists()` — 内部实现

## 定义与实现位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(未进行 lowering)`:0]()
- **函数符号**: `(无 — 仅类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数（builtin）。_

## 签名摘要

```php
function enum_exists(string $enum, bool $autoload): bool
```

## 类型检查器强制约束

- **参数个数（Arity）**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`enum_exists()` 的用户参考指南](../../../php/builtins/class/enum_exists.md)
