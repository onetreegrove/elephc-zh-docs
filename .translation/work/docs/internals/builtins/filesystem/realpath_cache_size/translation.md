---
title: "realpath_cache_size() — 内部实现"
description: "realpath_cache_size() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 139
---

## `realpath_cache_size()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3710](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3710) (`lower_realpath_cache_size`)
- **函数符号**: `lower_realpath_cache_size()`


### Lowering 说明

- 将 `realpath_cache_size()` lowering 为 0，因为 elephc 没有 realpath 缓存。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数（builtin）。_

## 签名摘要

```php
function realpath_cache_size(): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接受任何参数。

## 交叉引用

- [`realpath_cache_size()` 用户参考](../../../php/builtins/filesystem/realpath_cache_size.md)
