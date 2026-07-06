---
title: "str_starts_with() — 内部实现"
description: "str_starts_with() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 387
---

## `str_starts_with()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:139](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L139) (`lower_binary_string_runtime`)
- **函数符号**: `lower_binary_string_runtime()`

### Lowering 说明

- 对直接委托给运行时辅助函数的双参数字符串内置函数进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_explode`

## 签名摘要

```php
function str_starts_with(string $haystack, string $needle): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`str_starts_with()` 用户参考](../../../php/builtins/string/str_starts_with.md)
