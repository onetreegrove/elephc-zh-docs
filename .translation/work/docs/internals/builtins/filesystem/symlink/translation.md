---
title: "symlink() — 内部实现"
description: "symlink() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 144
---

## `symlink()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5448](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5448) (`lower_symlink`)
- **函数符号**: `lower_symlink()`


### Lowering 说明

- 通过感知目标平台的 libc 包装器对 `symlink(target, link)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fileatime`
- `__rt_link`
- `__rt_readlink`
- `__rt_symlink`

## 签名摘要

```php
function symlink(string $target, string $link): bool
```

## 类型检查器强制约束

- **参数个数 (Arity)**：恰好接受 2 个参数。

## 交叉引用

- [`symlink()` 用户参考](../../../php/builtins/filesystem/symlink.md)
