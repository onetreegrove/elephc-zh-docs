---
title: "fileperms() — 内部实现"
description: "fileperms() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 113
---

## `fileperms()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5484](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5484) (`lower_fileperms`)
- **函数符号**: `lower_fileperms()`


### Lowering 说明

- 对 `fileperms(path)` 进行 Lowering，并将运行时的整型或 false 结果进行装箱（box）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_filegroup`
- `__rt_fileinode`
- `__rt_fileowner`
- `__rt_fileperms`

## 签名摘要

```php
function fileperms(string $filename): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`fileperms()` 用户参考](../../../php/builtins/filesystem/fileperms.md)
