---
title: "is_resource() — 内部实现"
description: "is_resource() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 427
---

## `is_resource()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/types.rs`:400](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/types.rs#L400) (`lower_is_resource`)
- **函数符号**: `lower_is_resource()`

### Lowering 说明

- 对静态资源和装箱 Mixed 资源单元的 `is_resource(value)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function is_resource(mixed $value): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`is_resource()` 用户参考](../../../php/builtins/type/is_resource.md)
