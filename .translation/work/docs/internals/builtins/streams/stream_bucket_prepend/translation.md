---
title: "stream_bucket_prepend() — 内部实现"
description: "stream_bucket_prepend() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 334
---

## `stream_bucket_prepend()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`(not lowered)`:0]()
- **函数符号**: `(none — type-checker only)()`


## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function stream_bucket_prepend(mixed $brigade, mixed $bucket): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`stream_bucket_prepend()` 用户参考](../../../php/builtins/streams/stream_bucket_prepend.md)

