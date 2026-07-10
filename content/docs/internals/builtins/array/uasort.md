---
title: "uasort() — 内部实现"
description: "uasort() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 59
---

## `uasort()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1131](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1131) (`lower_uasort`)
- **函数符号**: `lower_uasort()`


### Lowering 说明

- 通过用于静态比较器的旧版自定义排序辅助接口，实现 `uasort()` 的 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_is_list`

## 签名摘要

```php
function uasort(array $array, callable $callback): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [uasort() 用户参考文档](../../../php/builtins/array/uasort.md)
