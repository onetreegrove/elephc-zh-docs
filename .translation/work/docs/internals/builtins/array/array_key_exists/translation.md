---
title: "array_key_exists() —— 内部实现"
description: "array_key_exists() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 18
---

## `array_key_exists()` —— 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays/key_exists.rs`:22](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays/key_exists.rs#L22) (`lower_array_key_exists`)
- **函数符号**：`lower_array_key_exists()`


### Lowering 说明

- 针对索引数组和关联数组进行 `array_key_exists()` 的 lowering 处理。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已被内联，或通过其他内置函数进行路由。_

## 签名摘要

```php
function array_key_exists(string $key, array $array): bool
```

## 类型检查器约束

- **参数数量 (Arity)**：恰好接受 2 个参数。

## 交叉引用

- [`array_key_exists()` 的用户参考文档](../../../php/builtins/array/array_key_exists.md)
