---
title: "strpos() — 内部实现"
description: "strpos() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 392
---

## `strpos()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:700](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L700) (`lower_string_position`)
- **函数符号**: `lower_string_position()`

### Lowering 说明

- 对 `strpos()`/`strrpos()` 进行 lowering，并将 position-or-false 结果装箱为 Mixed。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function strpos(string $haystack, string $needle, int $offset): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–3 个参数（1 个可选参数）。

## 交叉引用

- [`strpos()` 用户参考](../../../php/builtins/string/strpos.md)
