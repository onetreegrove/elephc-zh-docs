---
title: "hash_final() — 内部实现"
description: "hash_final() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 354
---

## `hash_final()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:302](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L302) (`lower_hash_final`)
- **函数符号**: `lower_hash_final()`


### Lowering 说明

- 通过增量 hash finalizer 对 `hash_final(context, binary?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_final`

## 签名摘要

```php
function hash_final(resource $context, bool $binary): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`hash_final()` 用户参考](../../../php/builtins/string/hash_final.md)
