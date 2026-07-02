---
title: "array_intersect_key() —— 内部实现"
description: "array_intersect_key() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 16
---

## `array_intersect_key()` —— 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:901](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L901) (`lower_array_intersect_key`)
- **函数符号**：`lower_array_intersect_key()`


### Lowering 说明

- 通过保留共享的第一个操作数的键，为两个关联数组降级实现 `array_intersect_key()`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_intersect_key`

## 签名摘要

```php
function array_intersect_key(array $array, ...$arrays): array
```

## 类型检查器约束

- **Arity**：恰好接受 1 个参数。
- **Variadic**：将多余的参数收集到 `$arrays` 中。

## 交叉引用

- [array_intersect_key() 用户参考](../../../php/builtins/array/array_intersect_key.md)
