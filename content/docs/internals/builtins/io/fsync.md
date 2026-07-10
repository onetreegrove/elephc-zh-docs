---
title: "fsync() —— 内部实现"
description: "fsync() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 171
---

## `fsync()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3261](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3261) (`lower_fsync`)
- **函数符号**: `lower_fsync()`


### Lowering 说明

- 通过共享的 fd sync 运行时辅助函数对 `fsync(stream)` 进行 Lowering 处理。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fflush`
- `__rt_fsync`

## 签名摘要

```php
function fsync(resource $stream): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`fsync()` 用户参考](../../../php/builtins/io/fsync.md)
