---
title: "is_readable() — 内部实现"
description: "is_readable() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 124
---

## `is_readable()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5608](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5608) (`lower_is_readable`)
- **函数符号**: `lower_is_readable()`


### Lowering 说明

- 通过目标平台感知的运行时 access 辅助函数对 `is_readable(path)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_executable`
- `__rt_is_readable`
- `__rt_is_writable`

## 签名摘要

```php
function is_readable(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`is_readable()` 用户参考](../../../php/builtins/filesystem/is_readable.md)
