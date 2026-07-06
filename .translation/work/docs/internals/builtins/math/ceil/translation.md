---
title: "ceil() —— 内部实现"
description: "ceil() 的编译器内部实现：lowering 路径、类型检查和运行时助手。"
sidebar:
  order: 238
---

## `ceil()` —— 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/math.rs`:75](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L75) (`lower_ceil`)
- **函数符号**：`lower_ceil()`


### Lowering 说明

- 为具体的类整型和浮点型操作数进行 `ceil()` 的 lowering。

## 运行时助手

_未捕获到直接的 `__rt_*` 助手 —— 其 lowering 被内联，或者路由到另一个内置函数。_

## 签名摘要

```php
function ceil(float $num): float
```

## 类型检查器约束

- **参数个数（Arity）**：仅接受 1 个参数。

## 交叉引用

- [`ceil()` 用户参考](../../../php/builtins/math/ceil.md)
