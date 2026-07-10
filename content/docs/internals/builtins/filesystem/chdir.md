---
title: "chdir() — 内部实现"
description: "chdir() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 97
---

## `chdir()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4438](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4438) (`lower_chdir`)
- **函数符号**: `lower_chdir()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数对 `chdir(path)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_chdir`
- `__rt_copy`
- `__rt_glob`
- `__rt_scandir`
- `__rt_tempnam`

## 签名概览

```php
function chdir(string $directory): bool
```

## 类型检查器约束

- **参数个数（Arity）**: 恰好接受 1 个参数。

## 交叉引用

- [`chdir()` 用户参考](../../../php/builtins/filesystem/chdir.md)
