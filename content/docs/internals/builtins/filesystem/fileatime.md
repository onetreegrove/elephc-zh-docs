---
title: "fileatime() — 内部实现"
description: "fileatime() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 107
---

## `fileatime()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5468](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5468) (`lower_fileatime`)
- **函数符号**: `lower_fileatime()`


### Lowering 说明

- 对 `fileatime(path)` 进行 Lowering，并对运行时的整型或 false 结果进行装箱（box）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fileatime`
- `__rt_filectime`
- `__rt_fileowner`
- `__rt_fileperms`

## 签名摘要

```php
function fileatime(string $filename): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`fileatime()` 用户参考](../../../php/builtins/filesystem/fileatime.md)
