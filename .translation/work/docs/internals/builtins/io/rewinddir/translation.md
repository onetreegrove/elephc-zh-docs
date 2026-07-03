---
title: "rewinddir() —— 内部实现"
description: "rewinddir() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 186
---

## `rewinddir()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3588](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3588) (`lower_rewinddir`)
- **函数符号**: `lower_rewinddir()`


### Lowering 说明

- 将 `rewinddir(dir_handle)` 进行 Lowering 处理，支持 libc、glob 和 userspace-wrapper 句柄。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_rewinddir`
- `__rt_user_wrapper_dir_rewinddir`

## 签名摘要

```php
function rewinddir(resource $dir_handle): void
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`rewinddir()` 用户参考](../../../php/builtins/io/rewinddir.md)
