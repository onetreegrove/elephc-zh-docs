---
title: "is_scalar() — 内部实现"
description: "is_scalar() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 428
---

## `is_scalar()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1553](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1553) (`lower_is_scalar`)
- **函数符号**: `lower_is_scalar()`

### Lowering 说明

- 对 `is_scalar()` 进行 lowering：对于 int/float/string/bool、非 null 的带标签标量，或运行时标签为 int (0)、string (1)、float (2) 或 bool (3) 的装箱 Mixed/Union 值，结果为 true。
- Null、数组、对象和资源都不是标量，这与 PHP 保持一致。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_scalar(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_scalar()` 用户参考](../../../php/builtins/type/is_scalar.md)
