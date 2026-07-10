---
title: "buffer_len() — 内部实现"
description: "buffer_len() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 63
---

## `buffer_len()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/buffers.rs`:19](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/buffers.rs#L19) (`lower_buffer_len`)
- **函数符号**: `lower_buffer_len()`


### Lowering 说明

- 通过直接 buffer 操作码辅助函数对 `buffer_len()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者通过另一个内置函数进行路由。_

## 签名摘要

```php
function buffer_len(buffer $buffer): int
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**：精确接收 1 个参数。

## 交叉引用

- [`buffer_len()` 的用户参考手册](../../../php/builtins/buffer/buffer_len.md)
