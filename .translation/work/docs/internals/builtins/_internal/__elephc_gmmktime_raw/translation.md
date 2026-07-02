---
title: "__elephc_gmmktime_raw() —— 内部实现"
description: "__elephc_gmmktime_raw() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 269
---

## `__elephc_gmmktime_raw()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:151](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L151) (`lower_gmmktime`)
- **函数符号**: `lower_gmmktime()`


### Lowering 说明

- `gmmktime()` 内置函数使用的内部辅助函数。
- 绕过时区处理并直接调用运行时 `gmmktime` 辅助函数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_checkdate`
- `__rt_getdate`
- `__rt_gmmktime`

## 签名摘要

```php
function __elephc_gmmktime_raw(int $hour, int $minute, int $second, int $month, int $day, int $year): int
```

## 类型检查器约束

- **Arity**: 恰好接受 6 个参数。

## 交叉引用

- _无面向用户的参考 —— 这是一个编译器内部辅助函数。_
