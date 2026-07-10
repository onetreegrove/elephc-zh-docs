---
title: "ksort() — 内部实现"
description: "ksort() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 52
---

## `ksort()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1096](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1096) (`lower_ksort`)
- **函数符号**: `lower_ksort()`


### Lowering 说明

- 通过遗留的键排序辅助接口进行 `ksort()` 的 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_krsort`
- `__rt_ksort`
- `__rt_natcasesort`
- `__rt_natsort`

## 签名摘要

```php
function ksort(array $array, int $flags): bool
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 恰好接受 2 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [`ksort()` 用户参考](../../../php/builtins/array/ksort.md)
