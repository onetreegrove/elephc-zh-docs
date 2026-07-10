---
title: "stream_set_timeout() — 内部实现"
description: "stream_set_timeout() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 212
---

## `stream_set_timeout()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2267](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2267) (`lower_stream_set_timeout`)
- **函数符号**: `lower_stream_set_timeout()`


### Lowering 说明

- 对 `stream_set_timeout(stream, seconds, microseconds?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已内联或路由至另一个内置函数。_

## 签名摘要

```php
function stream_set_timeout(resource $stream, int $seconds, int $microseconds): bool
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 接受 2–3 个参数（其中 1 个可选）。

## 交叉引用

- [`stream_set_timeout()` 的用户参考](../../../php/builtins/io/stream_set_timeout.md)
