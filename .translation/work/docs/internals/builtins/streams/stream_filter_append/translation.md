---
title: "stream_filter_append() — 内部实现"
description: "stream_filter_append() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 335
---

## `stream_filter_append()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function stream_filter_append(resource $stream, string $filter_name, int $mode, mixed $params): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–4 个参数（2 个可选参数）。

## 交叉引用

- [`stream_filter_append()` 用户参考](../../../php/builtins/streams/stream_filter_append.md)

