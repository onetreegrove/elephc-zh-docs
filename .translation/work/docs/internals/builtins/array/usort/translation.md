---
title: "usort() —— 内部实现"
description: "usort() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 61
---

## `usort()` —— 内部实现

## 实现位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1121](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1121) (`lower_usort`)
- **函数符号**: `lower_usort()`


### Lowering 备注

- 针对具有静态用户比较器的索引整数数组进行 `usort()` 的 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_is_list`

## 签名摘要

```php
function usort(array $array, callable $callback): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接收 2 个参数。
- **传引用参数**: `$array`。

## 交叉引用

- [`usort()` 用户参考](../../../php/builtins/array/usort.md)
