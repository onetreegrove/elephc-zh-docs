---
title: "array_diff() - 内部实现"
description: "array_diff() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 6
---

## `array_diff()` - 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:874](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L874) (`lower_array_diff`)
- **函数符号**：`lower_array_diff()`


### Lowering 说明

- 针对两个具有兼容索引的数组，通过指针大小的负载槽对 `array_diff()` 执行 Lowering。

## 运行时辅助函数

会引用以下运行时辅助函数：
- `__rt_array_diff`
- `__rt_array_diff_key`
- `__rt_array_diff_refcounted`
- `__rt_array_intersect`
- `__rt_array_intersect_key`
- `__rt_array_intersect_refcounted`

## 签名摘要

```php
function array_diff(array $array, ...$arrays): array
```

## 类型检查器约束

- **参数个数（Arity）**：恰好接受 1 个参数。
- **可变参数（Variadic）**：将多余参数收集到 `$arrays` 中。

## 交叉引用

- [array_diff() 的用户参考](../../../php/builtins/array/array_diff.md)
