---
title: "copy() — 内部实现"
description: "copy() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 102
---

## `copy()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4443](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4443) (`lower_copy`)
- **函数符号**: `lower_copy()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数来 lower `copy(source, dest)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_copy`
- `__rt_glob`
- `__rt_scandir`
- `__rt_tempnam`

## 签名摘要

```php
function copy(string $from, string $to, mixed $context): bool
```

## 类型检查器约束

- **参数个数（Arity）**: 恰好接收 3 个参数。

## 交叉引用

- [`copy()` 的用户参考手册](../../../php/builtins/filesystem/copy.md)
