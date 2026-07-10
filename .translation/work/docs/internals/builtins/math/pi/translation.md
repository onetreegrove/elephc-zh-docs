---
title: "pi() — 内部实现"
description: "pi() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 258
---

## `pi()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:638](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L638) (`lower_pi`)
- **函数符号**: `lower_pi()`


### Lowering 说明

- 将 `pi()` lowering 为旧后端使用的同一个数据段浮点常量。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function pi(): float
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接收参数。

## 交叉引用

- [`pi()` 用户参考](../../../php/builtins/math/pi.md)

