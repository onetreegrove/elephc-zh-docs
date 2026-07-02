---
title: "date_default_timezone_set() —— 内部实现"
description: "date_default_timezone_set() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 86
---

## `date_default_timezone_set()` —— 内部实现

## 定义位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:84](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L84) (`lower_date_default_timezone_set`)
- **函数符号**: `lower_date_default_timezone_set()`


### Lowering 说明

- 通过共享的运行时辅助函数对 `date_default_timezone_set(timezoneId)` 执行 lowering。
- 将标识符字符串载入到辅助函数所读取的寄存器中（其 ptr/len 位于
- ARM64 上的 `x1`/`x2`，x86_64 上的 `rax`/`rdx`），然后 `__rt_date_default_timezone_set`
- 通过 libc 的 `putenv` + `tzset` 应用它，并在整数结果寄存器中返回 PHP 的 `true`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_date_default_timezone_set`
- `__rt_microtime`
- `__rt_microtime_mixed`
- `__rt_microtime_str`

## 签名摘要

```php
function date_default_timezone_set(string $timezoneId): bool
```

## 类型检查器强制执行的约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`date_default_timezone_set()` 的用户参考](../../../php/builtins/date/date_default_timezone_set.md)
