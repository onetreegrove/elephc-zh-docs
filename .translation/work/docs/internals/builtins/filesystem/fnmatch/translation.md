---
title: "fnmatch() — 内部实现"
description: "fnmatch() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 116
---

## `fnmatch()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4603](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4603) (`lower_fnmatch`)
- **函数符号**: `lower_fnmatch()`


### Lowering 说明

- 通过目标平台感知的运行时辅助函数对 `fnmatch(pattern, filename, flags?)` 执行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数——Lowering 已被内联，或者路由到了另一个内置函数。_

## 签名摘要

```php
function fnmatch(string $pattern, string $filename, int $flags): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 2–3 个参数（其中 1 个可选）。

## 交叉引用

- [`fnmatch()` 的用户参考手册](../../../php/builtins/filesystem/fnmatch.md)
