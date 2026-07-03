---
title: "readlink() — 内部实现"
description: "readlink() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 136
---

## `readlink()` — 内部实现

## 实现位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5458](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5458) (`lower_readlink`)
- **函数符号**: `lower_readlink()`


### Lowering 说明

- 对 `readlink(path)` 进行 lowering 并装箱拥有所有权的运行时 string-or-false 结果。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fileatime`
- `__rt_filectime`
- `__rt_fileperms`
- `__rt_readlink`

## 签名摘要

```php
function readlink(string $path): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：正好接收 1 个参数。

## 交叉引用

- [针对 `readlink()` 的用户参考](../../../php/builtins/filesystem/readlink.md)
