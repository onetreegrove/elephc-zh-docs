---
title: "shuffle() — 内部实现"
description: "shuffle() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 57
---

## `shuffle()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1116](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1116) (`lower_shuffle`)
- **函数符号**: `lower_shuffle()`


### Lowering 说明

- 通过就地修改源数组，实现具有 8 字节槽位（slot）的索引数组的 `shuffle()` Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_is_list`

## 签名摘要

```php
function shuffle(array $array): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [shuffle() 用户参考文档](../../../php/builtins/array/shuffle.md)
