---
title: "readdir() —— 内部实现"
description: "readdir() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 184
---

## `readdir()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3557](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3557) (`lower_readdir`)
- **函数符号**: `lower_readdir()`


### Lowering 说明

- 将 `readdir(dir_handle)` 进行 Lowering 处理，支持 libc、glob 和 userspace-wrapper 句柄。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_closedir`
- `__rt_readdir`
- `__rt_user_wrapper_dir_closedir`
- `__rt_user_wrapper_dir_readdir`

## 签名摘要

```php
function readdir(resource $dir_handle): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`readdir()` 用户参考](../../../php/builtins/io/readdir.md)
