---
title: "spl_classes() — 内部实现"
description: "spl_classes() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 328
---

## `spl_classes()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:205](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L205) (`lower_spl_classes`)
- **函数符号**: `lower_spl_classes()`


### Lowering 说明

- 将 `spl_classes()` lowering 为编译器随附的静态 SPL/core 类型快照。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_itoa`

## 签名摘要

```php
function spl_classes(): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接收参数。

## 交叉引用

- [`spl_classes()` 用户参考](../../../php/builtins/spl/spl_classes.md)

