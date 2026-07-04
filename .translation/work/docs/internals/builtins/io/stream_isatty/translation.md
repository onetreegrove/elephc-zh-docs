---
title: "stream_isatty() — 内部实现"
description: "stream_isatty() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 206
---

## `stream_isatty()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:2127](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2127) (`lower_stream_isatty`)
- **函数符号**：`lower_stream_isatty()`


### Lowering 说明

- 对 `stream_isatty(stream)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_isatty`

## 签名摘要

```php
function stream_isatty(resource $stream): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：有且仅有 1 个参数。

## 交叉引用

- [`stream_isatty()` 用户参考](../../../php/builtins/io/stream_isatty.md)
