---
title: "rewind() — 内部实现"
description: "rewind() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 185
---

## `rewind()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3196](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3196) (`lower_rewind`)
- **函数符号**: `lower_rewind()`


### Lowering 说明

- 将 `rewind(stream)` lower 为 `lseek(fd, 0, SEEK_SET)`，并在成功时清除 EOF 状态。

## 运行时辅助函数

_未直接捕获到 `__rt_*` 辅助函数 —— lowering 已被内联，或路由到了其他内置函数。_

## 签名摘要

```php
function rewind(resource $stream): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`rewind()` 用户参考](../../../php/builtins/io/rewind.md)
