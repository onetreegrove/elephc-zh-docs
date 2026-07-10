---
title: "opendir() —— 内部实现"
description: "opendir() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 183
---

## `opendir()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3547](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3547) (`lower_opendir`)
- **函数符号**: `lower_opendir()`


### Lowering 说明

- 将 `opendir(path)` 进行 Lowering 处理，并将目录流装箱为 `resource|false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_opendir`
- `__rt_readdir`
- `__rt_user_wrapper_dir_readdir`

## 签名摘要

```php
function opendir(string $directory): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`opendir()` 用户参考](../../../php/builtins/io/opendir.md)
