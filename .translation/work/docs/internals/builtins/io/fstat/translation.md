---
title: "fstat() —— 内部实现"
description: "fstat() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 170
---

## `fstat()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5539](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5539) (`lower_fstat`)
- **函数符号**: `lower_fstat()`


### Lowering 说明

- 将 `fstat(stream)` 进行 Lowering 处理，并对运行时 stat 数组或 PHP false 结果进行装箱。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fstat_array`

## 签名摘要

```php
function fstat(resource $stream): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`fstat()` 用户参考](../../../php/builtins/io/fstat.md)
