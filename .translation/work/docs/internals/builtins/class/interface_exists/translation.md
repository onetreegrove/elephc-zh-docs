---
title: "interface_exists() — 内部实现"
description: "interface_exists() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 79
---

## `interface_exists()` — 内部实现

## 所在位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`(未 lowering)`:0]()
- **函数符号**：`(无 — 仅类型检查器)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已内联或路由至另一个内置函数。_

## 签名摘要

```php
function interface_exists(string $interface, bool $autoload): bool
```

## 类型检查器约束

- **参数个数**：接收 1–2 个参数（1 个可选）。

## 交叉引用

- [`interface_exists()` 用户参考](../../../php/builtins/class/interface_exists.md)
