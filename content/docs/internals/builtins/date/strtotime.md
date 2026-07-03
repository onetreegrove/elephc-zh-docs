---
title: "strtotime() — 内部实现"
description: "strtotime() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 94
---

## `strtotime()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:487](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L487) (`lower_strtotime`)
- **函数符号**: `lower_strtotime()`


### Lowering 说明

- 通过共享的解析器运行时辅助函数对 `strtotime(datetime[, baseTimestamp])` 进行 Lowering。
- 返回 PHP 的 `int|false`：`__rt_strtotime` 的 `i64::MIN` 解析失败哨兵值被装箱为
- `Mixed` `false`，而其他所有值（包括 Epoch 纪元前的真实 `-1` 时间戳）则被装箱为
- `Mixed` 整数，因此 `=== false`、`=== -1` 和 `echo` 都能观察到不同的结果。
- 支持 PHP 可选的 `$baseTimestamp`。（`__elephc_strtotime_raw` 别名保留了纯粹的
- `-1` 整数形式，用于合成的 `DateTime` 内部实现。）

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_from_value`
- `__rt_strtotime`

## 签名摘要

```php
function strtotime(string $datetime, int $baseTimestamp): mixed
```

## 类型检查器约束

- **Arity**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`strtotime()` 用户参考](../../../php/builtins/date/strtotime.md)
