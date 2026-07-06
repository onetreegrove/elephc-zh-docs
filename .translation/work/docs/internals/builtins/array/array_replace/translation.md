---
title: "array_replace() — 内部实现"
description: "array_replace() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 32
---

## `array_replace()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1328](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1328) (`lower_array_replace`)
- **函数符号**: `lower_array_replace()`


### Lowering 说明

- Lowering `array_replace()`（两个哈希的合并，冲突时右侧覆盖）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_replace`
- `__rt_array_replace_recursive`
- `__rt_assoc_diff_intersect`

## 签名摘要

```php
function array_replace(array $array, array $replacements): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 必须且仅接受 2 个参数。

## 交叉引用

- [`array_replace()` 用户参考](../../../php/builtins/array/array_replace.md)
