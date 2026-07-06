---
title: "ptr_write16() — 内部实现"
description: "ptr_write16() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 299
---

## `ptr_write16()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/pointers.rs`:161](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/pointers.rs#L161) (`lower_ptr_write16`)
- **函数符号**: `lower_ptr_write16()`


### Lowering 说明

- 通过经过检查的指针写入一个 16 位字，对 `ptr_write16(pointer, value)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_ptr_write_string`

## 签名摘要

```php
function ptr_write16(pointer $pointer, int $value): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`ptr_write16()` 用户参考](../../../php/builtins/pointer/ptr_write16.md)

