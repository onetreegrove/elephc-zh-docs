---
title: "stream_wrapper_register() —— 内部实现"
description: "stream_wrapper_register() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 224
---

## `stream_wrapper_register()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1000](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1000) (`lower_stream_wrapper_register`)
- **函数符号**: `lower_stream_wrapper_register()`


### Lowering 说明

- 对 `stream_wrapper_register(protocol, class, flags?)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_wrapper_register`

## 签名摘要

```php
function stream_wrapper_register(string $protocol, string $class, int $flags): bool
```

## 类型检查器约束

- **参数数量 (Arity)**: 接受 2–3 个参数（其中 1 个可选）。

## 交叉引用

- [`stream_wrapper_register()` 用户参考](../../../php/builtins/io/stream_wrapper_register.md)
