---
title: "htmlspecialchars() — 内部实现"
description: "htmlspecialchars() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 361
---

## `htmlspecialchars()` — 内部实现

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
function htmlspecialchars(string $string, int $flags, string $encoding, bool $double_encode): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 4 个参数。

## 交叉引用

- [`htmlspecialchars()` 用户参考](../../../php/builtins/string/htmlspecialchars.md)
