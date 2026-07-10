---
title: "preg_replace() — 内部实现"
description: "preg_replace() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 316
---

## `preg_replace()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/regex.rs`:65](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/regex.rs#L65) (`lower_preg_replace`)
- **函数符号**: `lower_preg_replace()`


### Lowering 说明

- 通过 regex replacement 辅助函数对 `preg_replace(pattern, replacement, subject)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_preg_replace`

## 签名摘要

```php
function preg_replace(string $pattern, string $replacement, string $subject, int $limit = -1, int $count = null): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 3–5 个参数（2 个可选参数）。
- **引用传递参数**: `$count`。

## 交叉引用

- [`preg_replace()` 用户参考](../../../php/builtins/regex/preg_replace.md)

