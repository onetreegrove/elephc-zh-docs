---
title: "array_pop() — 内部实现"
description: "array_pop() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 27
---

## `array_pop()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1048](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1048) (`lower_array_pop`)
- **函数符号**: `lower_array_pop()`


### Lowering 说明

- 通过修改长度并将 `T|null` 装箱为 Mixed，实现索引数组的 `array_pop()` Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sort_int`
- `__rt_sort_str`

## 签名摘要

```php
function array_pop(array $array): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [array_pop() 用户参考文档](../../../php/builtins/array/array_pop.md)
