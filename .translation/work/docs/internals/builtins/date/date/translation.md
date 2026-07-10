---
title: "date() — 内部实现"
description: "date() 的编译器内部实现：lowering 路径、类型检查和运行时助手。"
sidebar:
  order: 84
---

## `date()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:22](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L22) (`lower_date`)
- **函数符号**: `lower_date()`


### Lowering 说明

- 通过共享的格式化器运行时助手对 `date(format, timestamp?)` 进行 lowering。

## 运行时助手

引用了以下运行时助手：
- `__rt_date`
- `__rt_gmdate`

## 签名摘要

```php
function date(string $format, int $timestamp): string
```

## 类型检查器约束

- **参数数量**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`date()` 的用户参考文档](../../../php/builtins/date/date.md)
