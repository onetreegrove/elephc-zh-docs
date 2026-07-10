---
title: "buffer_free() — 内部实现"
description: "buffer_free() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 62
---

## `buffer_free()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering (降级)**: [`src/codegen_ir/lower_inst/builtins/buffers.rs`:24](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/buffers.rs#L24) (`lower_buffer_free`)
- **函数符号**: `lower_buffer_free()`


### Lowering 说明

- 通过直接 buffer 操作码辅助函数来降级 `buffer_free()`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 降级过程已内联，或路由至其他内置函数。_

## 签名摘要

```php
function buffer_free(buffer $buffer): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`buffer_free()` 用户参考](../../../php/builtins/buffer/buffer_free.md)
