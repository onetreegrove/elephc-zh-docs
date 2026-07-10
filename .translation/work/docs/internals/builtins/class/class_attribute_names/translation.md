---
title: "class_attribute_names() — 内部实现"
description: "class_attribute_names() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 66
---

## `class_attribute_names()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/attributes.rs`:36](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/attributes.rs#L36) (`lower_class_attribute_names`)
- **函数符号**: `lower_class_attribute_names()`


### Lowering 说明

- 将 `class_attribute_names(class)` lowering 为索引字符串数组。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已被内联，或路由至其他内置函数（builtin）。_

## 签名摘要

```php
function class_attribute_names(string $class_name): array
```

## 类型检查器约束

- **Arity**: 恰好接受 1 个参数。

## 交叉引用

- [`class_attribute_names()` 用户参考](../../../php/builtins/class/class_attribute_names.md)
