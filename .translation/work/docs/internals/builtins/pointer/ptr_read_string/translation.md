---
title: "ptr_read_string() — 内部实现"
description: "ptr_read_string() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 296
---

## `ptr_read_string()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/pointers.rs`:134](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/pointers.rs#L134) (`lower_ptr_read_string`)
- **函数符号**: `lower_ptr_read_string()`


### Lowering 说明

- 通过将原始字节复制到自有 PHP 字符串中，对 `ptr_read_string(pointer, length)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_ptr_read_string`

## 签名摘要

```php
function ptr_read_string(pointer $pointer, int $length): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`ptr_read_string()` 用户参考](../../../php/builtins/pointer/ptr_read_string.md)

