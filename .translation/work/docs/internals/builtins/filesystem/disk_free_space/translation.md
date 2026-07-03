---
title: "disk_free_space() — 内部实现"
description: "disk_free_space() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 104
---

## `disk_free_space()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3370](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3370) (`lower_disk_free_space`)
- **函数符号**: `lower_disk_free_space()`


### Lowering 说明

- 通过共享的磁盘空间运行时辅助函数对 `disk_free_space(path)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_disk_space`

## 签名概览

```php
function disk_free_space(string $directory): float
```

## 类型检查器约束

- **参数个数（Arity）**: 恰好接受 1 个参数。

## 交叉引用

- [`disk_free_space()` 用户参考](../../../php/builtins/filesystem/disk_free_space.md)
