---
title: "array_search() —— 内部实现"
description: "array_search() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 35
---

## `array_search()` —— 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:1710](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1710) (`lower_array_search`)
- **函数符号**：`lower_array_search()`


### Lowering 说明

- 针对含有类整数 payload 的索引数组，进行 `array_search()` 的 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程为内联实现，或路由至其他内置函数。_

## 签名摘要

```php
function array_search(mixed $needle, array $haystack, bool $strict): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 2–3 个参数（其中 1 个为可选参数）。

## 交叉引用

- [`array_search()` 用户参考](../../../php/builtins/array/array_search.md)
