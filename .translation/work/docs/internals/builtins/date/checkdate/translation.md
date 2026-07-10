---
title: "checkdate() — 内部实现"
description: "checkdate() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 83
---

## `checkdate()` — 内部实现

## 实现位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:163](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L163) (`lower_checkdate`)
- **函数符号**: `lower_checkdate()`


### Lowering 说明

- 通过共享的格里高利历验证运行时辅助函数对 `checkdate(month, day, year)` 执行 lowering。
- 将这三个整数整理到前导 ABI 参数寄存器中（拆箱任何已装箱的
- `Mixed`/`Union` 参数），然后调用 `__rt_checkdate`，它在
- 整数结果寄存器中返回 PHP 的 `true`/`false`，以表示有效/无效的日期。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_checkdate`
- `__rt_getdate`

## 签名摘要

```php
function checkdate(int $month, int $day, int $year): bool
```

## 类型检查器约束

- **参数个数**: 正好接受 3 个参数。

## 交叉引用

- [`checkdate()` 的用户参考](../../../php/builtins/date/checkdate.md)
