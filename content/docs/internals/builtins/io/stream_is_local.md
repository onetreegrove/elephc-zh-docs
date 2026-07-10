---
title: "stream_is_local() — 内部实现"
description: "stream_is_local() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 205
---

## `stream_is_local()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:2103](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2103) (`lower_stream_is_local`)
- **函数符号**：lower_stream_is_local()


### Lowering 说明

- 在对其参数求值后，将 `stream_is_local(stream)` lower 为一个真谓词。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或路由至其他内置函数。_

## 签名摘要

```php
function stream_is_local(resource $stream): bool
```

## 类型检查器约束

- **参数数 (Arity)**：恰好接受 1 个参数。

## 交叉引用

- [`stream_is_local()` 的用户参考](../../../php/builtins/io/stream_is_local.md)
