---
title: "array_diff_key() - 内部实现"
description: "array_diff_key() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 8
---

## `array_diff_key()` - 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:896](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L896) (`lower_array_diff_key`)
- **函数符号**：`lower_array_diff_key()`


### Lowering 说明

- 针对两个关联数组，通过过滤第一个操作数中的键对 `array_diff_key()` 执行 Lowering。

## 运行时辅助函数

会引用以下运行时辅助函数：
- `__rt_array_diff_key`
- `__rt_array_intersect_key`

## 签名摘要

```php
function array_diff_key(array $array, ...$arrays): array
```

## 类型检查器约束

- **参数个数（Arity）**：恰好接受 1 个参数。
- **可变参数（Variadic）**：将多余参数收集到 `$arrays` 中。

## 交叉引用

- [array_diff_key() 的用户参考](../../../php/builtins/array/array_diff_key.md)
