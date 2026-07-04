---
title: "stream_context_set_option() —— 内部实现"
description: "stream_context_set_option() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 194
---

## `stream_context_set_option()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1098](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1098) (`lower_stream_context_set_option`)
- **函数符号**: `lower_stream_context_set_option()`


### Lowering 说明

- 降级 `stream_context_set_option(context, options)` 以及四参数形式。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 降级过程是内联的，或者路由通过另一个内置函数。_

## 签名摘要

```php
function stream_context_set_option(resource $context, string $wrapper_or_options, string $option_name, mixed $value): bool
```

## 类型检查器约束

- **Arity**: 接受 2–4 个参数（其中 2 个可选）。

## 交叉引用

- [`stream_context_set_option()` 的用户参考](../../../php/builtins/io/stream_context_set_option.md)
