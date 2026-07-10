---
title: "stream_copy_to_stream() — 内部实现"
description: "stream_copy_to_stream() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 196
---

## `stream_copy_to_stream()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1360](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1360) (`lower_stream_copy_to_stream`)
- **函数符号**: `lower_stream_copy_to_stream()`


### Lowering 说明

- 将 `stream_copy_to_stream(from, to, length?, offset?)` lowering 为感知包装器（wrapper-aware）的读写循环。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 其 Lowering 过程已被内联，或路由至其他内建函数（builtin）。_

## 签名摘要

```php
function stream_copy_to_stream(resource $from, resource $to, int $length, int $offset): mixed
```

## 类型检查器强制执行的规则

- **参数个数（Arity）**：接受 2–4 个参数（其中 2 个可选）。

## 交叉引用

- [`stream_copy_to_stream()` 的用户参考](../../../php/builtins/io/stream_copy_to_stream.md)
