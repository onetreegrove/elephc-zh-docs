---
title: "fprintf() — 内部实现"
description: "fprintf() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 165
---

## `fprintf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2862](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2862) (`lower_fprintf`)
- **函数符号**: `lower_fprintf()`


### Lowering 说明

- 将 `fprintf(stream, format, values...)` Lowering 为 `sprintf()` 加上流写入。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sprintf`

## 签名摘要

```php
function fprintf(resource $stream, string $format, ...$values): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。
- **可变参数 (Variadic)**: 将多余参数收集到 `$values` 中。

## 交叉引用

- [`fprintf()` 用户参考](../../../php/builtins/io/fprintf.md)
