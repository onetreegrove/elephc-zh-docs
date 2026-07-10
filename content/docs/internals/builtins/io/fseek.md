---
title: "fseek() —— 内部实现"
description: "fseek() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 169
---

## `fseek()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3172](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3172) (`lower_fseek`)
- **函数符号**: `lower_fseek()`


### Lowering 说明

- 将 `fseek(stream, offset, whence?)` 进行 Lowering 处理，并在成功时清除 EOF 状态。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程已被内联或路由至另一个内置函数。_

## 签名摘要

```php
function fseek(resource $stream, int $offset, int $whence): int
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 2–3 个参数（其中 1 个可选）。

## 交叉引用

- [`fseek()` 用户参考](../../../php/builtins/io/fseek.md)
