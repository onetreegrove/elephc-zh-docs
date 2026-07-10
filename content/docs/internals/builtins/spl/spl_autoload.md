---
title: "spl_autoload() — 内部实现"
description: "spl_autoload() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 322
---

## `spl_autoload()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/spl.rs`:150](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/spl.rs#L150) (`lower_spl_autoload_void`)
- **函数符号**: `lower_spl_autoload_void()`


### Lowering 说明

- 通过保留参数副作用，并在结果被使用时返回 PHP null，对 no-op autoload 调用进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function spl_autoload(string $class, string $file_extensions): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`spl_autoload()` 用户参考](../../../php/builtins/spl/spl_autoload.md)

