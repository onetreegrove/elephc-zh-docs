---
title: "__elephc_phar_list_entries() —— 内部实现"
description: "__elephc_phar_list_entries() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 439
---

## `__elephc_phar_list_entries()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4277](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4277) (`lower_elephc_phar_list_entries`)
- **函数符号**: `lower_elephc_phar_list_entries()`


### Lowering 说明

- 内置 Phar / PharData 支持所使用的内部辅助函数，用于枚举归档条目。
- 调用原生 PHAR 列表桥接器，并以数组形式返回条目。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已被内联，或者通过另一个内置函数进行路由。_

## 签名摘要

```php
function __elephc_phar_list_entries(mixed $filename): array
```

## 类型检查器约束

- **参数数量 (Arity)**：仅接受 1 个参数。

## 交叉引用

- _无面向用户的参考 —— 这是一个编译器内部辅助函数。_
