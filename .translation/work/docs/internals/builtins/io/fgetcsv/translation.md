---
title: "fgetcsv() — 内部实现"
description: "fgetcsv() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 157
---

## `fgetcsv()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2993](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2993) (`lower_fgetcsv`)
- **函数符号**: `lower_fgetcsv()`


### Lowering 说明

- 通过 CSV 行运行时辅助函数对 `fgetcsv(stream, separator?, enclosure?)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fgetcsv`
- `__rt_fputcsv`

## 签名摘要

```php
function fgetcsv(resource $stream, int $length, string $separator, string $enclosure, string $escape): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 3–5 个参数（其中 2 个可选）。

## 交叉引用

- [`fgetcsv()` 用户参考](../../../php/builtins/io/fgetcsv.md)
