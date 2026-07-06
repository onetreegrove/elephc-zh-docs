---
title: "unset() — 内部实现"
description: "unset() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 286
---

## `unset()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/types.rs`:48](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/types.rs#L48) (`lower_unset_builtin`)
- **函数符号**: `lower_unset_builtin()`


### Lowering 说明

- 拒绝未被转换为直接 EIR unbind 操作的 `unset()` 调用。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function unset(mixed $var, ...$vars): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$vars`。

## 交叉引用

- [`unset()` 用户参考](../../../php/builtins/misc/unset.md)

