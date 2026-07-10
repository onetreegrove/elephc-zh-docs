---
title: "stream_get_transports() — 内部实现"
description: "stream_get_transports() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 203
---

## `stream_get_transports()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:1477](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1477) (`lower_stream_get_transports`)
- **函数符号**: `lower_stream_get_transports()`


### Lowering 说明

- 将 `stream_get_transports()` Lowering 为静态传输协议列表。

## 运行时辅助函数

_没有捕获到直接的 `__rt_*` 辅助函数 —— 其 Lowering 过程已被内联，或者通过其他内建函数进行路由。_

## 签名摘要

```php
function stream_get_transports(): array
```

## 类型检查器强制执行的规则

- **参数个数 (Arity)**: 不接受任何参数。

## 交叉引用

- [`stream_get_transports()` 用户参考手册](../../../php/builtins/io/stream_get_transports.md)
