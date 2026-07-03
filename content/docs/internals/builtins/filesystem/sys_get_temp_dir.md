---
title: "sys_get_temp_dir() — 内部实现"
description: "sys_get_temp_dir() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 145
---

## `sys_get_temp_dir()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5403](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5403) (`lower_sys_get_temp_dir`)
- **函数符号**: `lower_sys_get_temp_dir()`


### Lowering 说明

- 将 `sys_get_temp_dir()` lower 为项目硬编码的 `/tmp` 字符串。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_tmpfile`

## 签名摘要

```php
function sys_get_temp_dir(): string
```

## 类型检查器约束

- **参数数量 (Arity)**: 不接受任何参数。

## 交叉引用

- [`sys_get_temp_dir()` 用户参考](../../../php/builtins/filesystem/sys_get_temp_dir.md)
