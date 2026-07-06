---
title: "str_ireplace() — 内部实现"
description: "str_ireplace() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 382
---

## `str_ireplace()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function str_ireplace(mixed $search, mixed $replace, mixed $subject, int $count): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 3–4 个参数（1 个可选参数）。
- **按引用传递的参数**: `$count`。

## 交叉引用

- [`str_ireplace()` 用户参考](../../../php/builtins/string/str_ireplace.md)
