---
title: "preg_replace_callback() — 内部实现"
description: "preg_replace_callback() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 317
---

## `preg_replace_callback()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/regex.rs`:90](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/regex.rs#L90) (`lower_preg_replace_callback`)
- **函数符号**: `lower_preg_replace_callback()`


### Lowering 说明

- 通过受支持的直接 callback 对 `preg_replace_callback(pattern, callback, subject)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_preg_replace_callback`

## 签名摘要

```php
function preg_replace_callback(string $pattern, callable $callback, string $subject, int $limit = -1, int $count = null, int $flags = 0): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 3–6 个参数（3 个可选参数）。
- **引用传递参数**: `$count`。

## 交叉引用

- [`preg_replace_callback()` 用户参考](../../../php/builtins/regex/preg_replace_callback.md)

