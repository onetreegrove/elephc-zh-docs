---
title: "preg_match_all() — 内部实现"
description: "preg_match_all() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 315
---

## `preg_match_all()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/regex.rs`:52](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/regex.rs#L52) (`lower_preg_match_all`)
- **函数符号**: `lower_preg_match_all()`


### Lowering 说明

- 通过共享 regex 运行时辅助函数对 `preg_match_all(pattern, subject)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_preg_match_all`

## 签名摘要

```php
function preg_match_all(string $pattern, string $subject, array $matches): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 3 个参数。
- **引用传递参数**: `$matches`。

## 交叉引用

- [`preg_match_all()` 用户参考](../../../php/builtins/regex/preg_match_all.md)

