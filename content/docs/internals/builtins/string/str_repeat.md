---
title: "str_repeat() — 内部实现"
description: "str_repeat() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 384
---

## `str_repeat()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:746](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L746) (`lower_str_repeat`)
- **函数符号**: `lower_str_repeat()`

### Lowering 说明

- 通过共享的运行时辅助函数对 `str_repeat(string, times)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_str_repeat`

## 签名摘要

```php
function str_repeat(string $string, int $times): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`str_repeat()` 用户参考](../../../php/builtins/string/str_repeat.md)
