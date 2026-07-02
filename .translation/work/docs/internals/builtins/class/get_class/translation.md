---
title: "get_class() — 内部实现"
description: "get_class() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 74
---

## `get_class()` — 内部实现

## 所在位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`(not lowered)`:0]()
- **函数符号**：`(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 — lowering 过程已内联，或路由至其他 builtin。_

## 签名摘要

```php
function get_class(object $object): string
```

## 类型检查器强制执行的约束

- **Arity**：接受 0–1 个参数（其中 1 个可选）。

## 交叉引用

- [`get_class()` 用户参考](../../../php/builtins/class/get_class.md)
