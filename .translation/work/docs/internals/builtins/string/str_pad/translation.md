---
title: "str_pad() — 内部实现"
description: "str_pad() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 383
---

## `str_pad()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:818](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L818) (`lower_str_pad`)
- **函数符号**: `lower_str_pad()`

### Lowering 说明

- 通过共享的运行时辅助函数对 `str_pad(string, length, pad_string?, pad_type?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_str_pad`

## 签名摘要

```php
function str_pad(string $string, int $length, string $pad_string, int $pad_type): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–4 个参数（2 个可选参数）。

## 交叉引用

- [`str_pad()` 用户参考](../../../php/builtins/string/str_pad.md)
