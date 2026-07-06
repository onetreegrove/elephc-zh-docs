---
title: "str_split() — 内部实现"
description: "str_split() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 386
---

## `str_split()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:176](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L176) (`lower_str_split`)
- **函数符号**: `lower_str_split()`

### Lowering 说明

- 将 `str_split(string, length?)` lowering 到定宽 string-array splitter。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_str_split`

## 签名摘要

```php
function str_split(string $string, int $length): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`str_split()` 用户参考](../../../php/builtins/string/str_split.md)
