---
title: "is_executable() — 内部实现"
description: "is_executable() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 121
---

## `is_executable()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5632](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5632) (`lower_is_executable`)
- **函数符号**: `lower_is_executable()`


### Lowering 说明

- 通过目标平台感知的运行时 access 辅助函数对 `is_executable(path)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_executable`
- `__rt_is_link`
- `__rt_path_is_wrapper`
- `__rt_readfile`

## 签名摘要

```php
function is_executable(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`is_executable()` 用户参考](../../../php/builtins/filesystem/is_executable.md)
