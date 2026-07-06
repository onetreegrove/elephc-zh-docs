---
title: "define() — 内部实现"
description: "define() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 275
---

## `define()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:591](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L591) (`lower_define`)
- **函数符号**: `lower_define()`


### Lowering 说明

- 对带有旧版重复名称运行时保护的 `define("NAME", value)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function define(string $constant_name, mixed $value, bool $case_insensitive): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 3 个参数。

## 交叉引用

- [`define()` 用户参考](../../../php/builtins/misc/define.md)

