---
title: "fgetc() — 内部实现"
description: "fgetc() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 156
---

## `fgetc()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2980](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2980) (`lower_fgetc`)
- **函数符号**: `lower_fgetc()`


### Lowering 说明

- 对 `fgetc(stream)` 进行 lowering，并装箱（boxing）单字节字符串或 PHP 的 false 结果。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fgetc`
- `__rt_fgetcsv`

## 签名摘要

```php
function fgetc(resource $stream): mixed
```

## 类型检查器约束

- **Arity**: 只接受 1 个参数。

## 交叉引用

- [`fgetc()` 的用户参考](../../../php/builtins/io/fgetc.md)
