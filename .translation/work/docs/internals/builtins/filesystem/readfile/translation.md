---
title: "readfile() — 内部实现"
description: "readfile() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 135
---

## `readfile()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:300](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L300) (`lower_readfile`)
- **函数符号**: `lower_readfile()`


### Lowering 说明

- 对 `readfile(path)` 进行 Lowering，并将运行时的字节数或 false 结果进行装箱（box）。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个 builtin。_

## 签名摘要

```php
function readfile(string $filename, bool $use_include_path, mixed $context): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 3 个参数。

## 交叉引用

- [`readfile()` 的用户参考](../../../php/builtins/filesystem/readfile.md)
