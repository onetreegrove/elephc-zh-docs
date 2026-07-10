---
title: "natsort() — 内部实现"
description: "natsort() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 54
---

## `natsort()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1106](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1106) (`lower_natsort`)
- **函数符号**: `lower_natsort()`


### Lowering 说明

- 通过自然排序包装器对索引整数数组的 `natsort()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_natcasesort`
- `__rt_natsort`

## 签名摘要

```php
function natsort(array $array): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接收 1 个参数。
- **引用参数**: `$array`。

## 交叉引用

- [`natsort()` 用户参考](../../../php/builtins/array/natsort.md)
