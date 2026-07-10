---
title: "fdatasync() — 内部实现"
description: "fdatasync() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 153
---

## `fdatasync()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3304](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3304) (`lower_fdatasync`)
- **函数符号**: `lower_fdatasync()`


### Lowering 说明

- 通过共享的 fd data-sync 运行时辅助函数进行 `fdatasync(stream)` 的 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fdatasync`

## 签名摘要

```php
function fdatasync(resource $stream): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接收 1 个参数。

## 交叉引用

- [`fdatasync()` 的用户参考](../../../php/builtins/io/fdatasync.md)
