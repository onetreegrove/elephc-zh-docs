---
title: "getcwd() — 内部实现"
description: "getcwd() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 117
---

## `getcwd()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5396](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5396) (`lower_getcwd`)
- **函数符号**: `lower_getcwd()`


### Lowering 说明

- 通过感知目标平台（target-aware）的运行时辅助函数进行 `getcwd()` 的 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getcwd`
- `__rt_tmpfile`

## 签名摘要

```php
function getcwd(): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接受参数。

## 交叉引用

- [`getcwd()` 用户参考](../../../php/builtins/filesystem/getcwd.md)
