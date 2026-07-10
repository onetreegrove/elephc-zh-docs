---
title: "min() — 内部实现"
description: "min() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 256
---

## `min()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:204](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L204) (`lower_min_max`)
- **函数符号**: `lower_min_max()`


### Lowering 说明

- 对具体类整型或浮点型操作数上的数值型 `min()` 和 `max()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function min(mixed $value, ...$values): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$values`。

## 交叉引用

- [`min()` 用户参考](../../../php/builtins/math/min.md)

