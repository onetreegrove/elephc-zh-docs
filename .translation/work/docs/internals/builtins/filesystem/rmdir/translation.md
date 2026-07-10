---
title: "rmdir() — 内部实现"
description: "rmdir() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 141
---

## `rmdir()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4433](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4433) (`lower_rmdir`)
- **函数符号**: `lower_rmdir()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数对 `rmdir(path)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_chdir`
- `__rt_copy`
- `__rt_rmdir`
- `__rt_scandir`
- `__rt_tempnam`

## 签名摘要

```php
function rmdir(string $directory, mixed $context = null): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：接收 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`rmdir()` 用户参考](../../../php/builtins/filesystem/rmdir.md)
