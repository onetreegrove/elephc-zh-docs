---
title: "tempnam() — 内部实现"
description: "tempnam() 的编译器内部实现：lower 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 146
---

## `tempnam()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4453](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4453) (`lower_tempnam`)
- **函数符号**：`lower_tempnam()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数来 lower `tempnam(directory, prefix)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_glob`
- `__rt_scandir`
- `__rt_tempnam`

## 签名摘要

```php
function tempnam(string $directory, string $prefix): string
```

## 类型检查器约束

- **Arity**：恰好接受 2 个参数。

## 交叉引用

- [`tempnam()` 用户参考](../../../php/builtins/filesystem/tempnam.md)
