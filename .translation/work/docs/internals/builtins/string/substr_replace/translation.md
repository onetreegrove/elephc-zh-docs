---
title: "substr_replace() — 内部实现"
description: "substr_replace() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 399
---

## `substr_replace()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:730](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L730) (`lower_substr_replace`)
- **函数符号**: `lower_substr_replace()`

### Lowering 说明

- 对 `substr_replace(string, replacement, start, length?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_str_repeat`
- `__rt_substr_replace`

## 签名摘要

```php
function substr_replace(string $string, string $replace, int $offset, int $length): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 3–4 个参数（1 个可选参数）。

## 交叉引用

- [`substr_replace()` 用户参考](../../../php/builtins/string/substr_replace.md)
