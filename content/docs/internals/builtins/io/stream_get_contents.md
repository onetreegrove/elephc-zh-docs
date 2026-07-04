---
title: "stream_get_contents() — 内部实现"
description: "stream_get_contents() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 199
---

## `stream_get_contents()` — 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:1301](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1301) (`lower_stream_get_contents`)
- **函数符号**：`lower_stream_get_contents()`


### Lowering 说明

- 将 `stream_get_contents(stream, length?, offset?)` lowering 为 `string|false`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程为内联，或路由至其他内置函数。_

## 签名摘要

```php
function stream_get_contents(resource $stream, int $length, int $offset): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 1–3 个参数（其中 2 个可选）。

## 交叉引用

- [`stream_get_contents()` 用户参考文档](../../../php/builtins/io/stream_get_contents.md)
