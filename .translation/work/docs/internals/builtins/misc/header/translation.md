---
title: "header() — 内部实现"
description: "header() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 278
---

## `header()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:289](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L289) (`lower_header`)
- **函数符号**: `lower_header()`


### Lowering 说明

- 将 `header($line[, $replace[, $code]])` lowering 到 `__rt_header`，并物化四个 C ABI 整数参数：arg0 为 line 指针，arg1 为 line 长度，arg2 为 `$replace`（默认为 true），arg3 为 `$response_code`（默认为 0）。`$replace`/`$code` 会先暂存到 scratch 中（它们的求值可能会调用 helper，从而覆盖字符串寄存器），随后加载 line 字符串，并将暂存的整数重新加载到 arg2/arg3。所有 PHP `header()` 行为都位于 bridge（`elephc_web_header`）中。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_header`

## 签名摘要

```php
function header(mixed $header, mixed $replace, mixed $response_code): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–3 个参数（2 个可选参数）。

## 交叉引用

- [`header()` 用户参考](../../../php/builtins/misc/header.md)

