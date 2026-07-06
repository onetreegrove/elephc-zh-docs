---
title: "ptr() — 内部实现"
description: "ptr() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 288
---

## `ptr()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/pointers.rs`:25](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/pointers.rs#L25) (`lower_ptr`)
- **函数符号**: `lower_ptr()`


### Lowering 说明

- 通过物化可取址本地/全局存储的地址，对 `ptr(value)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function ptr(mixed $value): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`ptr()` 用户参考](../../../php/builtins/pointer/ptr.md)

