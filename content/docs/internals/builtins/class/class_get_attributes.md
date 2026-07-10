---
title: "class_get_attributes() — 内部实现"
description: "class_get_attributes() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 68
---

## `class_get_attributes()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/attributes.rs`:68](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/attributes.rs#L68) (`lower_class_get_attributes`)
- **函数符号**: `lower_class_get_attributes()`


### Lowering 说明

- 将 `class_get_attributes(class)` Lowering 为 `ReflectionAttribute` 对象的数组。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者通过另一个 builtin 进行路由。_

## 签名摘要

```php
function class_get_attributes(string $class_name): mixed
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`class_get_attributes()` 用户参考](../../../php/builtins/class/class_get_attributes.md)
