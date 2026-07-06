---
title: "preg_split() — 内部实现"
description: "preg_split() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 318
---

## `preg_split()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/regex.rs`:374](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/regex.rs#L374) (`lower_preg_split`)
- **函数符号**: `lower_preg_split()`


### Lowering 说明

- 通过 regex split 辅助函数对 `preg_split(pattern, subject, limit?, flags?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_preg_split`

## 签名摘要

```php
function preg_split(string $pattern, string $subject, int $limit, int $flags): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–4 个参数（2 个可选参数）。

## 交叉引用

- [`preg_split()` 用户参考](../../../php/builtins/regex/preg_split.md)

