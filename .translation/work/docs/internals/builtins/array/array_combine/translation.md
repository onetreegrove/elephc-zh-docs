---
title: "array_combine() — 内部实现"
description: "array_combine() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 5
---

## `array_combine()` — 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:152](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L152) (`lower_array_combine`)
- **函数符号**：`lower_array_combine()`


### Lowering 说明

- 通过旧版的哈希构建运行时辅助函数对 `array_combine()` 执行 Lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 其 Lowering 是内联的，或者通过其他内置函数进行路由。_

## 签名摘要

```php
function array_combine(array $keys, array $values): array
```

## 类型检查器约束

- **参数个数（Arity）**：恰好接受 2 个参数。

## 交叉引用

- [array_combine() 的用户参考](../../../php/builtins/array/array_combine.md)
