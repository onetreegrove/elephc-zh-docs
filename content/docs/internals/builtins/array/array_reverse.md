---
title: "array_reverse() — 内部实现"
description: "array_reverse() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 34
---

## `array_reverse()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:185](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L185) (`lower_array_reverse`)
- **函数符号**: `lower_array_reverse()`

### Lowering 说明

- 针对具有 8 字节 payload 槽的索引数组对 `array_reverse()` 执行 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者路由到了另一个 builtin。_

## 签名摘要

```php
function array_reverse(array $array, bool $preserve_keys): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`array_reverse()` 用户参考](../../../php/builtins/array/array_reverse.md)
