---
title: "wordwrap() — 内部实现"
description: "wordwrap() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 407
---

## `wordwrap()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:802](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L802) (`lower_wordwrap`)
- **函数符号**: `lower_wordwrap()`

### Lowering 说明

- 通过共享的运行时辅助函数对 `wordwrap(string, width?, break?, cut?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_str_pad`
- `__rt_wordwrap`

## 签名摘要

```php
function wordwrap(string $string, int $width, string $break, bool $cut_long_words): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–4 个参数（3 个可选参数）。

## 交叉引用

- [`wordwrap()` 用户参考](../../../php/builtins/string/wordwrap.md)
