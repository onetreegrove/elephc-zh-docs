---
title: "array_map() — 内部实现"
description: "array_map() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 22
---

## `array_map()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:312](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L312) (`lower_array_map`)
- **函数符号**: `lower_array_map()`


### Lowering 说明

- 通过匹配回调结果类型的回调运行时辅助函数对 `array_map()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已内联，或路由到了其他内建函数。_

## 签名摘要

```php
function array_map(callable $callback, array $array, ...$arrays): array
```

## 类型检查器约束

- **参数个数（Arity）**: 恰好接受 2 个参数。
- **可变参数（Variadic）**: 将多余的参数收集到 `$arrays` 中。

## 交叉引用

- [`array_map()` 的用户参考](../../../php/builtins/array/array_map.md)
