---
title: "count() —— 内部实现"
description: "count() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 49
---

## `count()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:959](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L959) (`lower_count`)
- **函数符号**: `lower_count()`


### Lowering 说明

- 通过读取运行时长度头部，为具体的数组值 Lowering `count(array)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_count`

## 签名摘要

```php
function count(array $value, int $mode): int
```

## 类型检查器约束

- **Arity**: 接受 1–2 个参数（其中 1 个可选）。

## 交叉引用

- [`count()` 用户参考](../../../php/builtins/array/count.md)
