---
title: "fsockopen() — 内部实现"
description: "fsockopen() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 331
---

## `fsockopen()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function fsockopen(string $hostname, int $port, int $error_code, string $error_message, float $timeout): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–5 个参数（3 个可选参数）。
- **引用传递参数**: `$error_code`, `$error_message`。

## 交叉引用

- [`fsockopen()` 用户参考](../../../php/builtins/streams/fsockopen.md)

