---
title: "mktime() — 内部实现"
description: "mktime() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 93
---

## `mktime()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:140](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L140) (`lower_mktime`)
- **函数符号**: `lower_mktime()`


### Lowering 说明

- 通过运行时辅助函数对 `mktime(hour, minute, second, month, day, year)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_checkdate`
- `__rt_gmmktime`
- `__rt_mktime`

## 签名摘要

```php
function mktime(int $hour, int $minute, int $second, int $month, int $day, int $year): int
```

## 类型检查器约束

- **参数数量（Arity）**: 恰好接受 6 个参数。

## 交叉引用

- [`mktime()` 用户参考](../../../php/builtins/date/mktime.md)
