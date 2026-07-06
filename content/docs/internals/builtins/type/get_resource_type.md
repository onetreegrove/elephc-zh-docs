---
title: "get_resource_type() — 内部实现"
description: "get_resource_type() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 415
---

## `get_resource_type()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/types.rs`:412](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/types.rs#L412) (`lower_get_resource_type`)
- **函数符号**: `lower_get_resource_type()`

### Lowering 说明

- 将 `get_resource_type(resource)` lowering 为 elephc 当前的资源类型标签。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function get_resource_type(resource $resource): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`get_resource_type()` 用户参考](../../../php/builtins/type/get_resource_type.md)
