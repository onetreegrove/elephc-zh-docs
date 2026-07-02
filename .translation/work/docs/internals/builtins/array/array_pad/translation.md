---
title: "array_pad() — 内部实现"
description: "array_pad() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 26
---

## `array_pad()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:99](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L99) (`lower_array_pad`)
- **函数符号**: `lower_array_pad()`


### Lowering 说明

- 通过复制索引数组并填充缺失的槽位来实现 `array_pad()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function array_pad(array $array, int $length, mixed $value): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 3 个参数。

## 交叉引用

- [`array_pad()` 用户参考](../../../php/builtins/array/array_pad.md)
