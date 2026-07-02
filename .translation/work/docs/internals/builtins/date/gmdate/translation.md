---
title: "gmdate() — 内部实现"
description: "gmdate() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 88
---

## `gmdate()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:33](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L33) (`lower_gmdate`)
- **函数符号**: `lower_gmdate()`


### Lowering 说明

- 对 `gmdate(format[, timestamp])` 执行 lowering：它是 `date()` 的 UTC 对应版本。
- 与 `date()` 的参数整理（marshalling）完全相同，但会分派到 `__rt_gmdate`，无论当前生效的默认时区是什么，它都会将时间点格式化为 UTC。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_date`
- `__rt_gmdate`

## 签名摘要

```php
function gmdate(string $format, int $timestamp): string
```

## 类型检查器强制执行的规则

- **参数个数（Arity）**: 接受 1–2 个参数（其中 1 个为可选参数）。

## 交叉引用

- [`gmdate()` 用户参考](../../../php/builtins/date/gmdate.md)
