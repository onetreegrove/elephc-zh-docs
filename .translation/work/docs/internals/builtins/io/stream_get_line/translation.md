---
title: "stream_get_line() — 内部实现"
description: "stream_get_line() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 201
---

## `stream_get_line()` — 内部实现

## 所在位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:1393](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1393) (`lower_stream_get_line`)
- **函数符号**：`lower_stream_get_line()`


### Lowering 说明

- 对 `stream_get_line(stream, length, ending?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 其 Lowering 过程已被内联，或路由至其他内建函数（builtin）。_

## 签名摘要

```php
function stream_get_line(resource $stream, int $length, string $ending): string
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 2–3 个参数（其中 1 个可选）。

## 交叉引用

- [`stream_get_line()` 的用户参考](../../../php/builtins/io/stream_get_line.md)
