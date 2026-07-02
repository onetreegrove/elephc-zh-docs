---
title: "get_declared_traits() — 内部实现"
description: "get_declared_traits() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 77
---

## `get_declared_traits()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已内联或路由至其他 builtin。_

## 签名摘要

```php
function get_declared_traits(): array
```

## 类型检查器约束

- **参数个数**: 不接受任何参数。

## 交叉引用

- [`get_declared_traits()` 用户参考](../../../php/builtins/class/get_declared_traits.md)
