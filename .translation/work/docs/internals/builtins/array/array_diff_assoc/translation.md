---
title: "array_diff_assoc() - 内部实现"
description: "array_diff_assoc() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 7
---

## `array_diff_assoc()` - 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:1347](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1347) (`lower_array_diff_assoc`)
- **函数符号**：`lower_array_diff_assoc()`


### Lowering 说明

- 通过共享的关联数组差集/交集辅助函数对 `array_diff_assoc()` 执行 Lowering（mode 0 = diff）。

## 运行时辅助函数

会引用以下运行时辅助函数：
- `__rt_array_merge_recursive`
- `__rt_assoc_diff_intersect`

## 签名摘要

```php
function array_diff_assoc(array $array, ...$arrays): mixed
```

## 类型检查器约束

- **参数个数（Arity）**：恰好接受 1 个参数。
- **可变参数（Variadic）**：将多余参数收集到 `$arrays` 中。

## 交叉引用

- [array_diff_assoc() 的用户参考](../../../php/builtins/array/array_diff_assoc.md)
