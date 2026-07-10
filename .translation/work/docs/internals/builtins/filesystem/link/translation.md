---
title: "link() — 内部实现"
description: "link() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 129
---

## `link()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5453](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5453) (`lower_link`)
- **函数符号**: `lower_link()`


### Lowering 说明

- 通过感知目标平台的 libc 包装器 lower `link(oldpath, newpath)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fileatime`
- `__rt_filectime`
- `__rt_link`
- `__rt_readlink`

## 签名摘要

```php
function link(string $target, string $link): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`link()` 用户参考](../../../php/builtins/filesystem/link.md)
