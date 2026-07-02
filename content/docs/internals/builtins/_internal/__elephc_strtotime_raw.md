---
title: "__elephc_strtotime_raw() —— 内部实现"
description: "__elephc_strtotime_raw() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 271
---

## `__elephc_strtotime_raw()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:543](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L543) (`lower_elephc_strtotime_raw`)
- **函数符号**: `lower_elephc_strtotime_raw()`


### Lowering 说明

- `strtotime()` 内置函数使用的内部辅助函数。
- 为运行时 `strtotime` 辅助函数提供原始时间戳解析路径。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_strtotime`

## 签名摘要

```php
function __elephc_strtotime_raw(string $datetime, int $baseTimestamp): int
```

## 类型检查器约束

- **Arity**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- _无面向用户的参考 —— 这是一个编译器内部辅助函数。_
