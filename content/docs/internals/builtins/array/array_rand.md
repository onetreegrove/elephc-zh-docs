---
title: "array_rand() —— 内部实现"
description: "array_rand() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 30
---

## `array_rand()` —— 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/arrays.rs`:1007](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1007) (`lower_array_rand`)
- **函数符号**：`lower_array_rand()`


### Lowering 说明

- 针对索引数组 Lowering `array_rand()`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_rand`
- `__rt_mixed_cast_int`

## 签名摘要

```php
function array_rand(array $array, int $num): int
```

## 类型检查器约束

- **参数个数 (Arity)**：精确接收 2 个参数。

## 交叉引用

- [`array_rand()` 用户参考](../../../php/builtins/array/array_rand.md)
