---
title: "realpath_cache_get() — 内部实现"
description: "realpath_cache_get() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 138
---

## `realpath_cache_get()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3700](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3700) (`lower_realpath_cache_get`)
- **函数符号**: `lower_realpath_cache_get()`


### Lowering 说明

- 将 `realpath_cache_get()` lowering 为 elephc 的空 realpath 缓存视图。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数（builtin）。_

## 签名摘要

```php
function realpath_cache_get(): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接受任何参数。

## 交叉引用

- [`realpath_cache_get()` 用户参考](../../../php/builtins/filesystem/realpath_cache_get.md)
