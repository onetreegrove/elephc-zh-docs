---
title: "random_int() — 内部实现"
description: "random_int() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 262
---

## `random_int()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/random.rs`:40](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/random.rs#L40) (`lower_random_int`)
- **函数符号**: `lower_random_int()`


### Lowering 说明

- 在闭区间整数范围上对 `random_int()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function random_int(int $min, int $max): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`random_int()` 用户参考](../../../php/builtins/math/random_int.md)

