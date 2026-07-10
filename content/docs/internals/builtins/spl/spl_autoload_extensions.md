---
title: "spl_autoload_extensions() — 内部实现"
description: "spl_autoload_extensions() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 324
---

## `spl_autoload_extensions()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:177](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L177) (`lower_spl_autoload_extensions`)
- **函数符号**: `lower_spl_autoload_extensions()`


### Lowering 说明

- 针对旧版可变 extension 全局状态对 `spl_autoload_extensions()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function spl_autoload_extensions(string $file_extensions): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`spl_autoload_extensions()` 用户参考](../../../php/builtins/spl/spl_autoload_extensions.md)

