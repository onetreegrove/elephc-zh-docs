---
title: "array_sum() — 内部实现"
description: "array_sum() 的编译器内部实现：lowering 路径、类型检查和运行时辅助程序。"
sidebar:
  order: 39
---

## `array_sum()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:51](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L51) (`lower_array_sum`)
- **函数符号**: `lower_array_sum()`


### Lowering 说明

- 在支持的索引数组 payload 上对 `array_sum()` 执行 Lowering。

## 运行时辅助程序

引用了以下运行时辅助程序：
- `__rt_array_product`
- `__rt_array_sum`

## 签名摘要

```php
function array_sum(array $array): float
```

## 类型检查器约束

- **参数个数（Arity）**: 恰好接受 1 个参数。

## 交叉引用

- [`array_sum()` 的用户参考手册](../../../php/builtins/array/array_sum.md)
