---
title: "array_keys() — 内部实现"
description: "array_keys() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 21
---

## `array_keys()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays/keys.rs`:23](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays/keys.rs#L23) (`lower_array_keys`)
- **函数符号**: `lower_array_keys()`

### Lowering 说明

- 针对索引数组（indexed arrays）和关联数组（associative arrays）进行 `array_keys()` 的 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程已内联，或路由到了其他内建函数。_

## 签名摘要

```php
function array_keys(array $array, string $filter_value, bool $strict): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 3 个参数。

## 交叉引用

- [`array_keys()` 用户参考](../../../php/builtins/array/array_keys.md)
