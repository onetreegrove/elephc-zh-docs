---
title: "fflush() — 内部实现"
description: "fflush() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 155
---

## `fflush()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3266](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3266) (`lower_fflush`)
- **函数符号**: `lower_fflush()`


### Lowering 说明

- 通过共享的 fd flush 运行时辅助函数对 fflush(stream) 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fflush`

## 签名摘要

```php
function fflush(resource $stream): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`fflush()` 用户参考](../../../php/builtins/io/fflush.md)
