---
title: "flock() — 内部实现"
description: "flock() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 162
---

## `flock()` — 内部实现

## 定义位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3309](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3309) (`lower_flock`)
- **函数符号**: `lower_flock()`


### Lowering 说明

- 通过 libc `flock` 封装函数对 `flock(stream, operation, would_block?)` 执行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数——其 Lowering 是内联的，或通过另一个内置函数进行路由。_

## 签名摘要

```php
function flock(resource $stream, int $operation, bool $would_block): bool
```

## 类型检查器约束

- **参数数量**: 接受 2–3 个参数（其中 1 个可选）。
- **引用传递参数**: `$would_block`。

## 交叉引用

- [`flock()` 用户参考](../../../php/builtins/io/flock.md)
