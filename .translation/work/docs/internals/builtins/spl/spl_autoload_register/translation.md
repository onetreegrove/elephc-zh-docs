---
title: "spl_autoload_register() — 内部实现"
description: "spl_autoload_register() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 326
---

## `spl_autoload_register()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:134](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L134) (`lower_spl_autoload_bool`)
- **函数符号**: `lower_spl_autoload_bool()`


### Lowering 说明

- 通过保留参数副作用并返回 true，对 autoload registration stub 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function spl_autoload_register(callable $callback, bool $throw, bool $prepend): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 0–3 个参数（3 个可选参数）。

## 交叉引用

- [`spl_autoload_register()` 用户参考](../../../php/builtins/spl/spl_autoload_register.md)

