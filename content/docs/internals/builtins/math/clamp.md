---
title: "clamp() — 内部实现"
description: "clamp() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 239
---

## `clamp()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/math.rs`:80](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/math.rs#L80) (`lower_clamp`)
- **函数符号**: `lower_clamp()`


### Lowering 说明

- 对数值型的 `clamp(value, min, max)` 调用进行 lowering，并应用兼容 PHP 的边界检查。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 已内联或路由至其他内置函数。_

## 签名摘要

```php
function clamp(int $value, int $min, int $max): string
```

## 类型检查器强制约束

- **参数个数 (Arity)**：必须正好接受 3 个参数。

## 交叉引用

- [`clamp()` 的用户参考文档](../../../php/builtins/math/clamp.md)
