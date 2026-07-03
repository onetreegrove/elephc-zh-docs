---
title: "dirname() —— 内部实现"
description: "dirname() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 103
---

## `dirname()` —— 内部实现

## 所在位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4575](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4575) (`lower_dirname`)
- **函数符号**：`lower_dirname()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数对 `dirname(path, levels?)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_dirname`
- `__rt_dirname_levels`

## 签名摘要

```php
function dirname(string $path, int $levels): string
```

## 类型检查器约束

- **参数个数**：接收 1–2 个参数（其中 1 个为可选参数）。

## 交叉引用

- [`dirname()` 用户参考](../../../php/builtins/filesystem/dirname.md)
