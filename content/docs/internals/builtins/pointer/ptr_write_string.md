---
title: "ptr_write_string() — 内部实现"
description: "ptr_write_string() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 302
---

## `ptr_write_string()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/pointers.rs`:171](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/pointers.rs#L171) (`lower_ptr_write_string`)
- **函数符号**: `lower_ptr_write_string()`


### Lowering 说明

- 通过将 PHP 字符串字节复制到原始内存中，对 `ptr_write_string(pointer, string)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_ptr_write_string`

## 签名摘要

```php
function ptr_write_string(pointer $pointer, string $string): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`ptr_write_string()` 用户参考](../../../php/builtins/pointer/ptr_write_string.md)

