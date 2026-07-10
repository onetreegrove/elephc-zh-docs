---
title: "basename() — 内部实现"
description: "basename() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 96
---

## `basename()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4536](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4536) (`lower_basename`)
- **函数符号**: `lower_basename()`


### Lowering 说明

- 通过感知目标平台的运行时辅助函数对 `basename(path, suffix?)` 执行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程已内联，或路由到了其他内置函数。_

## 签名概览

```php
function basename(string $path, string $suffix): string
```

## 类型检查器约束

- **参数个数（Arity）**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`basename()` 用户参考](../../../php/builtins/filesystem/basename.md)
