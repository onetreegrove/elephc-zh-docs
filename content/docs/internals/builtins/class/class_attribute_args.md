---
title: "class_attribute_args() — 内部实现"
description: "class_attribute_args() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 65
---

## `class_attribute_args()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/attributes.rs`:52](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/attributes.rs#L52) (`lower_class_attribute_args`)
- **函数符号**: `lower_class_attribute_args()`


### Lowering 说明

- 将 `class_attribute_args(class, attr)` lowering 为一个索引 Mixed 数组。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已被内联，或路由至其他内置函数（builtin）。_

## 签名摘要

```php
function class_attribute_args(string $class_name, string $attribute_name): array
```

## 类型检查器约束

- **Arity**: 恰好接受 2 个参数。

## 交叉引用

- [`class_attribute_args()` 用户参考](../../../php/builtins/class/class_attribute_args.md)
