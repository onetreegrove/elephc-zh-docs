---
title: "is_dir() — 内部实现"
description: "is_dir() 的编译器内部实现：路径 lowering、类型检查以及运行时辅助函数。"
sidebar:
  order: 120
---

## `is_dir()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5600](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5600) (`lower_is_dir`)
- **函数符号**: `lower_is_dir()`


### Lowering 说明

- 通过目标平台感知的运行时 stat 辅助函数对 `is_dir(path)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_dir`
- `__rt_is_readable`
- `__rt_is_writable`

## 签名摘要

```php
function is_dir(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`is_dir()` 用户参考](../../../php/builtins/filesystem/is_dir.md)
