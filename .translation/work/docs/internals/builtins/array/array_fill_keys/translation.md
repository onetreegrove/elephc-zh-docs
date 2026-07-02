---
title: "array_fill_keys() —— 内部实现"
description: "array_fill_keys() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 10
---

## `array_fill_keys()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:138](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L138) (`lower_array_fill_keys`)
- **函数符号**: `lower_array_fill_keys()`


### Lowering 说明

- 通过旧版哈希构建运行时辅助函数降级处理 `array_fill_keys()`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 降级过程已被内联，或路由至其他内置函数。_

## 签名摘要

```php
function array_fill_keys(array $keys, mixed $value): array
```

## 类型检查器约束

- **Arity**: 恰好接受 2 个参数。

## 交叉引用

- [`array_fill_keys()` 的用户参考](../../../php/builtins/array/array_fill_keys.md)
