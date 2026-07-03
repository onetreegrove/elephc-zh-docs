---
title: "filectime() — 内部实现"
description: "filectime() 的编译器内部实现：lowering path、类型检查和运行时辅助函数。"
sidebar:
  order: 108
---

## `filectime()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5476](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5476) (`lower_filectime`)
- **函数符号**: `lower_filectime()`


### Lowering 说明

- 将 `filectime(path)` 进行 lowering，并装箱运行时的整型或 false 结果。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_filectime`
- `__rt_filegroup`
- `__rt_fileowner`
- `__rt_fileperms`

## 签名摘要

```php
function filectime(string $filename): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`filectime()` 的用户参考文档](../../../php/builtins/filesystem/filectime.md)
