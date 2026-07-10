---
title: "lstat() — 内部实现"
description: "lstat() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 131
---

## `lstat()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5534](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5534) (`lower_lstat`)
- **函数符号**: `lower_lstat()`


### Lowering 说明

- lower `lstat(path)` 并对运行时 lstat 数组或 PHP false 结果进行装箱。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fstat_array`
- `__rt_lstat_array`

## 签名摘要

```php
function lstat(string $filename): mixed
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`lstat()` 用户参考](../../../php/builtins/filesystem/lstat.md)
