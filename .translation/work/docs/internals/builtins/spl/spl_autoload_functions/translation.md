---
title: "spl_autoload_functions() — 内部实现"
description: "spl_autoload_functions() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 325
---

## `spl_autoload_functions()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:166](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L166) (`lower_spl_autoload_functions`)
- **函数符号**: `lower_spl_autoload_functions()`


### Lowering 说明

- 将 `spl_autoload_functions()` lowering 为 AOT 规则占位符的索引数组。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function spl_autoload_functions(): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接收参数。

## 交叉引用

- [`spl_autoload_functions()` 用户参考](../../../php/builtins/spl/spl_autoload_functions.md)

