---
title: "filegroup() — 内部实现"
description: "filegroup() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 109
---

## `filegroup()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5500](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5500) (`lower_filegroup`)
- **函数符号**: `lower_filegroup()`


### Lowering 说明

- 对 `filegroup(path)` 执行 lowering，并对运行时返回的整数或 `false` 结果进行装箱（box）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_filegroup`
- `__rt_fileinode`
- `__rt_filetype`
- `__rt_stat_array`

## 签名摘要

```php
function filegroup(string $filename): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`filegroup()` 的用户参考](../../../php/builtins/filesystem/filegroup.md)
