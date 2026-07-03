---
title: "clearstatcache() — 内部实现"
description: "clearstatcache() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 101
---

## `clearstatcache()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5578](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5578) (`lower_clearstatcache`)
- **函数符号**: `lower_clearstatcache()`


### Lowering 说明

- 在 EIR 操作数求值之后，将 `clearstatcache(...)` lowering 为有序的空操作（ordered no-op）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_dir`

## 签名摘要

```php
function clearstatcache(bool $clear_realpath_cache, string $filename): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 0–2 个参数（2 个为可选参数）。

## 交叉引用

- [`clearstatcache()` 的用户参考文档](../../../php/builtins/filesystem/clearstatcache.md)
