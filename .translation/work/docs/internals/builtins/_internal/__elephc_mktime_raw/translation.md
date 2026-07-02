---
title: "__elephc_mktime_raw() —— 内部实现"
description: "__elephc_mktime_raw() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 270
---

## `__elephc_mktime_raw()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:140](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L140) (`lower_mktime`)
- **函数符号**: `lower_mktime()`


### Lowering 说明

- `mktime()` 内置函数使用的内部辅助函数。
- 绕过时区处理并直接调用运行时 `mktime` 辅助函数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_checkdate`
- `__rt_gmmktime`
- `__rt_mktime`

## 签名摘要

```php
function __elephc_mktime_raw(int $hour, int $minute, int $second, int $month, int $day, int $year): int
```

## 类型检查器约束

- **Arity**: 恰好接受 6 个参数。

## 交叉引用

- _无面向用户的参考 —— 这是一个编译器内部辅助函数。_
