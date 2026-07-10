---
title: "var_dump() — 内部实现"
description: "var_dump() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 287
---

## `var_dump()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/debug.rs`:35](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/debug.rs#L35) (`lower_var_dump`)
- **函数符号**: `lower_var_dump()`


### Lowering 说明

- 为具体的标量/resource 值以及数组/hash 外壳进行 `var_dump(value)` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function var_dump(...$values): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接收参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$values`。

## 交叉引用

- [`var_dump()` 用户参考](../../../php/builtins/misc/var_dump.md)

