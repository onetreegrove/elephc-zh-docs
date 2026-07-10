---
title: "unlink() —— 内部实现"
description: "unlink() 的编译器内部实现：降低路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 150
---

## `unlink()` —— 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **降低**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4407](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4407) (`lower_unlink`)
- **函数符号**: `lower_unlink()`

### 降低说明

- 通过目标平台感知的运行时辅助函数降低 `unlink(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mkdir`
- `__rt_rmdir`
- `__rt_unlink`

## 签名摘要

```php
function unlink(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 仅接受 1 个参数。

## 交叉引用

- [unlink() 用户参考文档](../../../php/builtins/filesystem/unlink.md)
