---
title: "stream_context_set_default() — 内部实现"
description: "stream_context_set_default() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 193
---

## `stream_context_set_default()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:1088](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1088) (`lower_stream_context_set_default`)
- **函数符号**：`lower_stream_context_set_default()`


### Lowering 说明

- 对 `stream_context_set_default(options)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或路由至其他内置函数。_

## 签名摘要

```php
function stream_context_set_default(array $options): mixed
```

## 类型检查器约束

- **参数数 (Arity)**：恰好接受 1 个参数。

## 交叉引用

- [`stream_context_set_default()` 的用户参考](../../../php/builtins/io/stream_context_set_default.md)
