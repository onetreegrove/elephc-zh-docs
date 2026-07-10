---
title: "linkinfo() — 内部实现"
description: "linkinfo() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 130
---

## `linkinfo()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5440](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5440) (`lower_linkinfo`)
- **函数符号**: `lower_linkinfo()`


### Lowering 说明

- 通过感知目标平台的运行时 lstat 辅助函数 lower `linkinfo(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_link`
- `__rt_linkinfo`
- `__rt_readlink`
- `__rt_symlink`

## 签名摘要

```php
function linkinfo(string $path): int
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`linkinfo()` 用户参考](../../../php/builtins/filesystem/linkinfo.md)
