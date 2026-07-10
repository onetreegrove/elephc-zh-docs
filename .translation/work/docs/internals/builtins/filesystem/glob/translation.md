---
title: "glob() — 内部实现"
description: "glob() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 119
---

## `glob()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4463](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4463) (`lower_glob`)
- **函数符号**: `lower_glob()`


### Lowering 说明

- 通过目标平台感知的运行时 glob 展开辅助函数对 `glob(pattern)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_glob`

## 签名概要

```php
function glob(string $pattern, int $flags): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`glob()` 用户参考](../../../php/builtins/filesystem/glob.md)
