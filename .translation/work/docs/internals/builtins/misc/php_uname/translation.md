---
title: "php_uname() — 内部实现"
description: "php_uname() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 281
---

## `php_uname()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:672](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L672) (`lower_php_uname`)
- **函数符号**: `lower_php_uname()`


### Lowering 说明

- 通过感知目标平台的 uname 运行时辅助函数对 `php_uname(mode?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_php_uname`

## 签名摘要

```php
function php_uname(string $mode): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`php_uname()` 用户参考](../../../php/builtins/misc/php_uname.md)

