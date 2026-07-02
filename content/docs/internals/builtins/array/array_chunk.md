---
title: "array_chunk() — 内部实现"
description: "array_chunk() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 3
---

## `array_chunk()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:81](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L81) (`lower_array_chunk`)
- **函数符号**: `lower_array_chunk()`


### Lowering 说明

- 通过将索引数组拆分为嵌套的索引数组来对 `array_chunk()` 进行 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function array_chunk(array $array, int $length, bool $preserve_keys): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 3 个参数。

## 交叉引用

- [`array_chunk()` 用户参考](../../../php/builtins/array/array_chunk.md)
