---
title: "array_merge() —— 内部实现"
description: "array_merge() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 23
---

## `array_merge()` —— 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:850](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L850) (`lower_array_merge`)
- **函数符号**: `lower_array_merge()`


### Lowering 说明

- 对两个具有 8 字节有效负载槽（payload slots）的兼容索引数组的 `array_merge()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_diff`
- `__rt_array_diff_refcounted`

## 签名摘要

```php
function array_merge(...$arrays): array
```

## 类型检查器约束

- **参数个数 (Arity)**：不接收参数。
- **可变参数 (Variadic)**：将多余参数收集到 `$arrays` 中。

## 交叉引用

- [`array_merge()` 的用户参考文档](../../../php/builtins/array/array_merge.md)
