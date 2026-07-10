---
title: "settype() — 内部实现"
description: "settype() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 430
---

## `settype()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/types.rs`:25](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/types.rs#L25) (`lower_settype`)
- **函数符号**: `lower_settype()`

### Lowering 说明

- 通过修改解析后的局部槽并返回 true，对 `settype($local, "type")` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function settype(mixed $var, string $type): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。
- **按引用传递的参数**: `$var`。

## 交叉引用

- [`settype()` 用户参考](../../../php/builtins/type/settype.md)
