---
title: "closedir() — 内部实现"
description: "closedir() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 151
---

## `closedir()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3572](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3572) (`lower_closedir`)
- **函数符号**: `lower_closedir()`


### Lowering 说明

- 为 libc、glob 和用户空间包装器（userspace-wrapper）句柄 Lowering `closedir(dir_handle)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_closedir`
- `__rt_rewinddir`
- `__rt_user_wrapper_dir_closedir`
- `__rt_user_wrapper_dir_rewinddir`

## 签名摘要

```php
function closedir(resource $dir_handle): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`closedir()` 用户参考](../../../php/builtins/io/closedir.md)
