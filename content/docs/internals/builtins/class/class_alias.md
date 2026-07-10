---
title: "class_alias() — 内部实现"
description: "class_alias() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 64
---

## `class_alias()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/types.rs`:41](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/types.rs#L41) (`lower_class_alias`)
- **函数符号**: `lower_class_alias()`


### Lowering 说明

- 对 AOT 别名提取后保留的防御性 `class_alias()` 回退方案进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已被内联，或路由至其他内置函数（builtin）。_

## 签名摘要

```php
function class_alias(string $class, string $alias, bool $autoload): bool
```

## 类型检查器约束

- **Arity**: 接受 2–3 个参数（其中 1 个可选）。

## 交叉引用

- [`class_alias()` 用户参考](../../../php/builtins/class/class_alias.md)
