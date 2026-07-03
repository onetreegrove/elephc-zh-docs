---
title: "is_link() — 内部实现"
description: "is_link() 的编译器内部实现：降低路径、类型检查和运行时辅助函数。"
sidebar:
  order: 123
---

## `is_link()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **降低**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5640](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5640) (`lower_is_link`)
- **函数符号**: `lower_is_link()`


### 降低说明

- 通过感知目标平台的运行时 lstat 辅助函数来降低 `is_link(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_link`
- `__rt_path_is_wrapper`
- `__rt_readfile`
- `__rt_readfile_wrapper`

## 签名摘要

```php
function is_link(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`is_link()` 用户参考](../../../php/builtins/filesystem/is_link.md)
