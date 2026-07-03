---
title: "is_writeable() — 内部实现"
description: "is_writeable() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 126
---

## `is_writeable()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5624](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5624) (`lower_is_writeable`)
- **函数符号**: `lower_is_writeable()`


### Lowering 说明

- 对 `is_writeable(path)`（PHP 中 `is_writable(path)` 的别名）进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_executable`
- `__rt_is_link`
- `__rt_is_writable`

## 签名摘要

```php
function is_writeable(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`is_writeable()` 用户参考](../../../php/builtins/filesystem/is_writeable.md)
