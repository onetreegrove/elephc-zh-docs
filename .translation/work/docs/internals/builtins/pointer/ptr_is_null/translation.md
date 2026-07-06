---
title: "ptr_is_null() — 内部实现"
description: "ptr_is_null() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 290
---

## `ptr_is_null()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/pointers.rs`:56](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/pointers.rs#L56) (`lower_ptr_is_null`)
- **函数符号**: `lower_ptr_is_null()`


### Lowering 说明

- 通过将原始指针地址与零比较，对 `ptr_is_null(pointer)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function ptr_is_null(pointer $pointer): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`ptr_is_null()` 用户参考](../../../php/builtins/pointer/ptr_is_null.md)

