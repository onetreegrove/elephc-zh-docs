---
title: "stat() — 内部实现"
description: "stat() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 143
---

## `stat()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5529](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5529) (`lower_stat`)
- **函数符号**: `lower_stat()`


### Lowering 说明

- 对 `stat(path)` 进行 Lowering，并将运行时的 stat 数组或 PHP `false` 结果进行装箱（box）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fstat_array`
- `__rt_lstat_array`
- `__rt_stat_array`

## 签名摘要

```php
function stat(string $filename): mixed
```

## 类型检查器约束

- **参数个数（Arity）**：仅接受 1 个参数。

## 交叉引用

- [`stat()` 用户参考文档](../../../php/builtins/filesystem/stat.md)
