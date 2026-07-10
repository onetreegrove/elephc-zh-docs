---
title: "isset() — 内部实现"
description: "isset() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 280
---

## `isset()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/isset.rs`:24](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/isset.rs#L24) (`lower_isset`)
- **函数符号**: `lower_isset()`


### Lowering 说明

- 对已经由 EIR 前端求值的值进行 `isset()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function isset(mixed $var, ...$vars): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$vars`。

## 交叉引用

- [`isset()` 用户参考](../../../php/builtins/misc/isset.md)

