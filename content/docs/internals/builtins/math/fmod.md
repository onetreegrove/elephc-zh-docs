---
title: "fmod() — 内部实现"
description: "fmod() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 246
---

## `fmod()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/binary.rs`:85](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/binary.rs#L85) (`lower_fmod`)
- **函数符号**: `lower_fmod()`


### Lowering 说明

- 为具体的类整型和浮点型操作数进行 `fmod()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function fmod(float $num1, float $num2): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`fmod()` 用户参考](../../../php/builtins/math/fmod.md)
