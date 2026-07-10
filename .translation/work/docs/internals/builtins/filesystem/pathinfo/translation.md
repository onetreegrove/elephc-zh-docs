---
title: "pathinfo() — 内部实现"
description: "pathinfo() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 133
---

## `pathinfo()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4644](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4644) (`lower_pathinfo`)
- **函数符号**: `lower_pathinfo()`


### Lowering 说明

- 对 `pathinfo(path, flags?)` 执行 Lowering：通过字符串、数组或装箱的动态辅助函数实现。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_pathinfo_array`

## 签名摘要

```php
function pathinfo(string $path, int $flags): mixed
```

## 类型检查器约束

- **参数个数（Arity）**: 接收 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`pathinfo()` 用户参考](../../../php/builtins/filesystem/pathinfo.md)
