---
title: "stream_context_create() — 内部实现"
description: "stream_context_create() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 189
---

## `stream_context_create()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:1064](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1064) (`lower_stream_context_create`)
- **函数符号**：`lower_stream_context_create()`


### Lowering 说明

- 对 `stream_context_create(options?, params?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或路由至其他内置函数。_

## 签名摘要

```php
function stream_context_create(array $options, array $params): mixed
```

## 类型检查器约束

- **参数数 (Arity)**：接受 0–2 个参数（2 个可选）。

## 交叉引用

- [`stream_context_create()` 的用户参考](../../../php/builtins/io/stream_context_create.md)
