---
title: "array_multisort() — 内部实现"
description: "array_multisort() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 25
---

## `array_multisort()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1671](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1671) (`lower_array_multisort`)
- **函数符号**: `lower_array_multisort()`


### Lowering 说明

- 对 `array_multisort()` 进行 Lowering：对第一个索引数组进行升序稳定排序，并同步对第二个
- 数组进行就地协同重排。两个参数均为引用传递，因此每个参数都会使用
- `ensure_unique_sort_source` 进行写时复制（copy-on-write）拆分，且在运行时修改存储之前，（可能已重定位的）指针
- 会被写回其局部变量。返回 `true`。支持 8 字节标量索引数组。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_array_multisort`

## 签名摘要

```php
function array_multisort(array $array1, int $array2): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`array_multisort()` 用户参考](../../../php/builtins/array/array_multisort.md)
