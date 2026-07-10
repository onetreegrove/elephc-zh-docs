---
title: "gmmktime() — 内部实现"
description: "gmmktime() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 89
---

## `gmmktime()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:151](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L151) (`lower_gmmktime`)
- **函数符号**: `lower_gmmktime()`


### Lowering 说明

- 对 `gmmktime(...)` 执行 lowering：它是 `mktime()` 的 UTC 对应版本。
- 相同的六个整数参数编组（marshalling），但分发至 `__rt_gmmktime`，该函数
- 将拆解后的日期/时间解释为 UTC（`timegm`）而非本地时间。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_checkdate`
- `__rt_getdate`
- `__rt_gmmktime`

## 签名摘要

```php
function gmmktime(int $hour, int $minute, int $second, int $month, int $day, int $year): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 6 个参数。

## 交叉引用

- [`gmmktime()` 的用户参考](../../../php/builtins/date/gmmktime.md)
