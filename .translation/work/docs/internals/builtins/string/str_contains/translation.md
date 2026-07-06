---
title: "str_contains() — 内部实现"
description: "str_contains() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 380
---

## `str_contains()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:682](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L682) (`lower_str_contains`)
- **函数符号**: `lower_str_contains()`

### Lowering 说明

- 通过 `strpos()` 对 `str_contains()` 进行 lowering，并将找到的位置转换为 bool。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_strpos`

## 签名摘要

```php
function str_contains(string $haystack, string $needle): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`str_contains()` 用户参考](../../../php/builtins/string/str_contains.md)
