---
title: "array_product() — 内部实现"
description: "array_product() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 28
---

## `array_product()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:56](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L56) (`lower_array_product`)
- **函数符号**: `lower_array_product()`


### Lowering 说明

- 在支持的索引数组负载上对 `array_product()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_product`

## 签名摘要

```php
function array_product(array $array): float
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 1 个参数。

## 交叉引用

- [`array_product()` 的用户参考](../../../php/builtins/array/array_product.md)
