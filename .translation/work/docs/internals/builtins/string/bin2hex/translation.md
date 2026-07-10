---
title: "bin2hex() — 内部实现"
description: "bin2hex() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 340
---

## `bin2hex()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:76](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L76) (`lower_unary_string_runtime`)
- **函数符号**: `lower_unary_string_runtime()`


### Lowering 说明

- 对直接委托给运行时辅助函数的单参数字符串内置函数进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_grapheme_strrev`
- `__rt_strcopy`

## 签名摘要

```php
function bin2hex(string $string): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`bin2hex()` 用户参考](../../../php/builtins/string/bin2hex.md)

