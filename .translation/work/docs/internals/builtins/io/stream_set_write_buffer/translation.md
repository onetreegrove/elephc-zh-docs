---
title: "stream_set_write_buffer() — 内部实现"
description: "stream_set_write_buffer() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 213
---

## `stream_set_write_buffer()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2254](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2254) (`lower_stream_set_buffer`)
- **函数符号**: `lower_stream_set_buffer()`


### Lowering 说明

- 将流读/写缓冲区设置函数 Lowering 为表示成功的无操作（no-ops）。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程已被内联，或路由至其他内置函数。_

## 签名摘要

```php
function stream_set_write_buffer(resource $stream, int $size): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收恰好 2 个参数。

## 交叉引用

- [`stream_set_write_buffer()` 的用户参考](../../../php/builtins/io/stream_set_write_buffer.md)
