---
title: "feof() —— 内部实现"
description: "feof() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 154
---

## `feof()` —— 内部实现

## 实现位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3121](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3121) (`lower_feof`)
- **函数符号**: `lower_feof()`


### Lowering 备注

- 通过运行时 EOF 标志表辅助函数 lower `feof(stream)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_feof`
- `__rt_user_wrapper_ftell`

## 签名摘要

```php
function feof(resource $stream): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`feof()` 用户参考](../../../php/builtins/io/feof.md)
