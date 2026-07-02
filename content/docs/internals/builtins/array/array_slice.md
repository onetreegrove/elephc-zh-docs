---
title: "array_slice() —— 内部实现"
description: "array_slice() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 37
---

## `array_slice()` —— 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:906](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L906) (`lower_array_slice`)
- **函数符号**: `lower_array_slice()`


### Lowering 说明

- 对具有指针大小有效负载槽（payload slots）的索引数组的 `array_slice()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者通过另一个内置函数进行路由。_

## 签名摘要

```php
function array_slice(array $array, int $offset, int $length, bool $preserve_keys): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 3–4 个参数（其中 1 个可选）。

## 交叉引用

- [`array_slice()` 用户参考](../../../php/builtins/array/array_slice.md)
