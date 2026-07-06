---
title: "intdiv() — 内部实现"
description: "intdiv() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 248
---

## `intdiv()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math/binary.rs`:21](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math/binary.rs#L21) (`lower_intdiv`)
- **函数符号**: `lower_intdiv()`


### Lowering 说明

- 为具体的类整型数值操作数进行 `intdiv()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function intdiv(int $num1, int $num2): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`intdiv()` 用户参考](../../../php/builtins/math/intdiv.md)
