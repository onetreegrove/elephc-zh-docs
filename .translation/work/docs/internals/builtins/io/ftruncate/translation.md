---
title: "ftruncate() — 内部实现"
description: "ftruncate() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 173
---

## `ftruncate()` — 内部实现

## 实现位置

- **签名 (Signature)**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3210](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3210) (`lower_ftruncate`)
- **函数符号**: `lower_ftruncate()`


### Lowering 说明

- 通过共享的 fd truncate 运行时辅助函数来对 `ftruncate(stream, size)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 其 lowering 是内联的，或者路由至另一个内建函数。_

## 签名摘要

```php
function ftruncate(resource $stream, int $size): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 2 个参数。

## 交叉引用

- [`ftruncate()` 用户参考文档](../../../php/builtins/io/ftruncate.md)
