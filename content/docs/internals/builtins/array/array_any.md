---
title: "array_any() —— 内部实现"
description: "array_any() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 2
---

## `array_any()` —— 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:1531](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1531) (`lower_array_any`)
- **函数符号**：`lower_array_any()`


### Lowering 说明

- Lowering `array_any()`：当某个元素满足谓词（predicate）时返回 true。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_walk_recursive`

## 签名摘要

```php
function array_any(array $array, mixed $callback): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：必须且仅接受 2 个参数。

## 交叉引用

- [`array_any()` 用户参考](../../../php/builtins/array/array_any.md)
