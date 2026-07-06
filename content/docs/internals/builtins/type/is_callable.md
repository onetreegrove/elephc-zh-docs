---
title: "is_callable() — 内部实现"
description: "is_callable() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 420
---

## `is_callable()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:844](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L844) (`lower_is_callable`)
- **函数符号**: `lower_is_callable()`

### Lowering 说明

- 通过静态查找或运行时 callable 形状辅助函数对 `is_callable(value)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_callable_array`
- `__rt_is_callable_assoc`
- `__rt_is_callable_object`

## 签名摘要

```php
function is_callable(mixed $value, bool $syntax_only = false, string $callable_name = null): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–3 个参数（2 个可选参数）。
- **按引用传递的参数**: `$callable_name`。

## 交叉引用

- [`is_callable()` 用户参考](../../../php/builtins/type/is_callable.md)
