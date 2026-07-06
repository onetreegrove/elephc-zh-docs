---
title: "sscanf() — 内部实现"
description: "sscanf() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 379
---

## `sscanf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:163](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L163) (`lower_sscanf`)
- **函数符号**: `lower_sscanf()`

### Lowering 说明

- 将 `sscanf(string, format)` lowering 到共享的 scanner 辅助函数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sscanf`
- `__rt_str_split`

## 签名摘要

```php
function sscanf(string $string, string $format, ...$vars): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$vars` 中。

## 交叉引用

- [`sscanf()` 用户参考](../../../php/builtins/string/sscanf.md)
