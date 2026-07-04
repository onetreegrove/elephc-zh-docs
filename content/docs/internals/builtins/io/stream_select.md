---
title: "stream_select() — 内部实现"
description: "stream_select() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 208
---

## `stream_select()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:2316](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2316) (`lower_stream_select`)
- **函数符号**：`lower_stream_select()`


### Lowering 说明

- 对 `stream_select(read, write, except, seconds, microseconds?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function stream_select(array $read, array $write, array $except, int $seconds, int $microseconds): int
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 4–5 个参数（其中 1 个可选）。
- **按引用传递的参数**：`$read`、`$write`、`$except`。

## 交叉引用

- [stream_select() 用户参考文档](../../../php/builtins/io/stream_select.md)
