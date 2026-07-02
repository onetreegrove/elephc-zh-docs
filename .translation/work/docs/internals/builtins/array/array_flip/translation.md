---
title: "array_flip() — 内部实现"
description: "array_flip() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 13
---

## `array_flip()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:171](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L171) (`lower_array_flip`)
- **函数符号**: `lower_array_flip()`


### Lowering 说明

- 通过遗留的哈希构建运行时辅助函数来 lower `array_flip()`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者通过另一个内置函数进行路由。_

## 签名摘要

```php
function array_flip(array $array): float
```

## 类型检查器约束

- **参数个数**: 恰好接受 1 个参数。

## 交叉引用

- [`array_flip()` 用户参考](../../../php/builtins/array/array_flip.md)
