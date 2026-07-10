---
title: "getprotobyname() — 内部实现"
description: "getprotobyname() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 178
---

## `getprotobyname()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3444](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3444) (`lower_getprotobyname`)
- **函数符号**: `lower_getprotobyname()`


### Lowering 说明

- 对 `getprotobyname(protocol)` 进行 lowering，并将缺失的条目装箱为 PHP `false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getprotobyname`

## 签名摘要

```php
function getprotobyname(string $protocol): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 仅接受 1 个参数。

## 交叉引用

- [`getprotobyname()` 用户参考](../../../php/builtins/io/getprotobyname.md)
