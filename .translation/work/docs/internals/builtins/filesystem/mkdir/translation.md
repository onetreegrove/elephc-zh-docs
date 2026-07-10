---
title: "mkdir() — 内部实现"
description: "mkdir() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 132
---

## `mkdir()` — 内部实现

## 源码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4428](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4428) (`lower_mkdir`)
- **函数符号**：`lower_mkdir()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数来 lowering `mkdir(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_chdir`
- `__rt_copy`
- `__rt_mkdir`
- `__rt_rmdir`
- `__rt_tempnam`

## 签名摘要

```php
function mkdir(string $directory, int $permissions, bool $recursive, bool $context): bool
```

## 类型检查器约束

- **参数个数**：必须传入 4 个参数。

## 交叉引用

- [`mkdir()` 用户参考文档](../../../php/builtins/filesystem/mkdir.md)
