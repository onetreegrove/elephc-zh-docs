---
title: "filemtime() — 内部实现"
description: "filemtime() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 111
---

## `filemtime()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5432](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5432) (`lower_filemtime`)
- **函数符号**: `lower_filemtime()`


### Lowering 说明

- 通过目标平台感知的运行时 stat 辅助函数 lower `filemtime(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_filemtime`
- `__rt_link`
- `__rt_linkinfo`
- `__rt_readlink`
- `__rt_symlink`

## 签名摘要

```php
function filemtime(string $filename): int
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`filemtime()` 的用户参考](../../../php/builtins/filesystem/filemtime.md)
