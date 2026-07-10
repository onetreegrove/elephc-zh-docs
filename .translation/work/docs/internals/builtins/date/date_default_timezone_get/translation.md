---
title: "date_default_timezone_get() — 内部实现"
description: "date_default_timezone_get() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 85
---

## `date_default_timezone_get()` — 内部实现

## 所在位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:70](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L70) (`lower_date_default_timezone_get`)
- **函数符号**: `lower_date_default_timezone_get()`


### Lowering 说明

- 通过共享的运行时辅助函数对 `date_default_timezone_get()` 进行 Lowering。
- 不接受参数；`__rt_date_default_timezone_get` 会在字符串结果寄存器中返回已存储的时区标识符（若未设置，则返回字面量 `"UTC"`）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_date_default_timezone_get`
- `__rt_date_default_timezone_set`

## 签名摘要

```php
function date_default_timezone_get(): string
```

## 类型检查器约束

- **参数个数**: 不接受参数。

## 交叉引用

- [`date_default_timezone_get()` 的用户参考文档](../../../php/builtins/date/date_default_timezone_get.md)
