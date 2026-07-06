---
title: "trim() — 内部实现"
description: "trim() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 400
---

## `trim()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:112](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L112) (`lower_trim_like`)
- **函数符号**: `lower_trim_like()`

### Lowering 说明

- 对使用默认和显式 mask 的 `trim()`/`ltrim()`/`rtrim()`/`chop()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function trim(string $string, string $characters): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`trim()` 用户参考](../../../php/builtins/string/trim.md)
