---
title: "array_fill() —— 内部实现"
description: "array_fill() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 9
---

## `array_fill()` —— 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:115](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L115) (`lower_array_fill`)
- **函数符号**：`lower_array_fill()`


### Lowering 说明

- 为指针大小的标量及引用计数载荷降级实现 `array_fill()`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 降级过程是内联的，或者路由通过另一个内置函数。_

## 签名摘要

```php
function array_fill(int $start_index, int $count, mixed $value): array
```

## 类型检查器约束

- **Arity**：恰好接受 3 个参数。

## 交叉引用

- [array_fill() 用户参考](../../../php/builtins/array/array_fill.md)
