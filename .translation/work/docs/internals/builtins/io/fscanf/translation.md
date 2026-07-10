---
title: "fscanf() — 内部实现"
description: "fscanf() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 168
---

## `fscanf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2938](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2938) (`lower_fscanf`)
- **函数符号**: `lower_fscanf()`


### Lowering 说明

- 通过 `__rt_fgets` 和 `__rt_sscanf` 对 `fscanf(stream, format)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fgets`
- `__rt_sscanf`

## 签名摘要

```php
function fscanf(resource $stream, string $format, ...$vars): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。
- **可变参数 (Variadic)**: 将多余参数收集到 `$vars` 中。

## 交叉引用

- [`fscanf()` 用户参考](../../../php/builtins/io/fscanf.md)
