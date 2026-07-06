---
title: "number_format() — 内部实现"
description: "number_format() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 371
---

## `number_format()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:875](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L875) (`lower_number_format`)
- **函数符号**: `lower_number_format()`


### Lowering 说明

- 通过安排运行时辅助函数参数对 `number_format()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_number_format`

## 签名摘要

```php
function number_format(float $num, int $decimals, string $decimal_separator, string $thousands_separator): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–4 个参数（3 个可选参数）。

## 交叉引用

- [`number_format()` 用户参考](../../../php/builtins/string/number_format.md)
