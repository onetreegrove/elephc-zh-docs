---
title: "vsprintf() — 内部实现"
description: "vsprintf() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 406
---

## `vsprintf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:524](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L524) (`lower_vsprintf`)
- **函数符号**: `lower_vsprintf()`

### Lowering 说明

- 通过 array-to-sprintf 运行时桥接对 `vsprintf(format, values)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sprintf`

## 签名摘要

```php
function vsprintf(string $format, array $values): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`vsprintf()` 用户参考](../../../php/builtins/string/vsprintf.md)
