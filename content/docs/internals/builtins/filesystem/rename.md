---
title: "rename() — 内部实现"
description: "rename() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 140
---

## `rename()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4448](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4448) (`lower_rename`)
- **函数符号**: `lower_rename()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数对 `rename(from, to)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_glob`
- `__rt_scandir`
- `__rt_tempnam`

## 签名摘要

```php
function rename(string $from, string $to, mixed $context): bool
```

## 类型检查器强制约束

- **参数个数 (Arity)**：接收且仅接收 3 个参数。

## 交叉引用

- [`rename()` 的用户参考手册](../../../php/builtins/filesystem/rename.md)
