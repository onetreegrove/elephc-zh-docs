---
title: "abs() — 内部实现"
description: "abs() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 233
---

## `abs()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:43](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L43) (`lower_abs`)
- **函数符号**: `lower_abs()`


### Lowering 说明

- 针对具体的类整型和浮点型操作数进行 `abs()` 的 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_abs_mixed`

## 签名摘要

```php
function abs(int $num): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 仅接受 1 个参数。

## 交叉引用

- [`abs()` 用户参考手册](../../../php/builtins/math/abs.md)
