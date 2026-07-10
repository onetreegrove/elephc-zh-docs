---
title: "get_resource_id() — 内部实现"
description: "get_resource_id() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 414
---

## `get_resource_id()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/types.rs`:424](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/types.rs#L424) (`lower_get_resource_id`)
- **函数符号**: `lower_get_resource_id()`

### Lowering 说明

- 通过拆箱原生句柄并将其转换为从 1 开始的编号，对 `get_resource_id(resource)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function get_resource_id(resource $resource): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`get_resource_id()` 用户参考](../../../php/builtins/type/get_resource_id.md)
