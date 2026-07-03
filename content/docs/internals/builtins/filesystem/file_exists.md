---
title: "file_exists() — 内部实现"
description: "file_exists() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 106
---

## `file_exists()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4399](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4399) (`lower_file_exists`)
- **函数符号**: `lower_file_exists()`


### Lowering 说明

- 通过目标平台感知的运行时 stat 辅助函数对 `file_exists(path)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mkdir`
- `__rt_unlink`

## 签名摘要

```php
function file_exists(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`file_exists()` 用户参考](../../../php/builtins/filesystem/file_exists.md)
