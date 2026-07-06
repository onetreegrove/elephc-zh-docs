---
title: "phpversion() — 内部实现"
description: "phpversion() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 282
---

## `phpversion()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:776](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L776) (`lower_phpversion`)
- **函数符号**: `lower_phpversion()`


### Lowering 说明

- 将 `phpversion()` lowering 为编译器包版本字符串。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function phpversion(string $extension = null): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`phpversion()` 用户参考](../../../php/builtins/misc/phpversion.md)

