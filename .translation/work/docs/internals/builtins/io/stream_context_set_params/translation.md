---
title: "stream_context_set_params() — 内部实现"
description: "stream_context_set_params() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 195
---

## `stream_context_set_params()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1118](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1118) (`lower_stream_context_set_params`)
- **函数符号**: `lower_stream_context_set_params()`


### Lowering 说明

- 将 `stream_context_set_params(context, params)` 作为已接受的参数更新进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 该 lowering 过程已被内联，或路由到了另一个 builtin。_

## 函数签名摘要

```php
function stream_context_set_params(resource $context, array $params): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`stream_context_set_params()` 的用户参考](../../../php/builtins/io/stream_context_set_params.md)
