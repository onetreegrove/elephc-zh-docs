---
title: "chmod() — 内部实现"
description: "chmod() 的编译器内部实现：lowering 过程、类型检查和运行时辅助函数。"
sidebar:
  order: 99
---

## `chmod()` — 内部实现

## 实现位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4468](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4468) (`lower_chmod`)
- **函数符号**：`lower_chmod()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数来 lower `chmod(path, mode)`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已内联，或路由至另一个内置函数。_

## 签名摘要

```php
function chmod(string $filename, int $permissions): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 2 个参数。

## 交叉引用

- [`chmod()` 用户参考](../../../php/builtins/filesystem/chmod.md)
