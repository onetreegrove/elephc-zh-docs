---
title: "vfprintf() — 内部实现"
description: "vfprintf() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 227
---

## `vfprintf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2898](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2898) (`lower_vfprintf`)
- **函数符号**: `lower_vfprintf()`


### Lowering 说明

- 通过 `__rt_vsprintf` 然后是 `fwrite` 对 `vfprintf(stream, format, values)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fwrite`
- `__rt_vsprintf`

## 签名摘要

```php
function vfprintf(resource $stream, string $format, array $values): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 3 个参数。

## 交叉引用

- [`vfprintf()` 用户参考](../../../php/builtins/io/vfprintf.md)
