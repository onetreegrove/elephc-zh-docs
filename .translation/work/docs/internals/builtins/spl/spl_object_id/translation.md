---
title: "spl_object_id() — 内部实现"
description: "spl_object_id() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 330
---

## `spl_object_id()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:215](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L215) (`lower_spl_object_id`)
- **函数符号**: `lower_spl_object_id()`


### Lowering 说明

- 通过将加载到的对象指针作为整数返回，对 `spl_object_id(object)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_itoa`

## 签名摘要

```php
function spl_object_id(object $object): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`spl_object_id()` 用户参考](../../../php/builtins/spl/spl_object_id.md)

