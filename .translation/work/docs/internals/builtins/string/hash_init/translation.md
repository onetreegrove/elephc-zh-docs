---
title: "hash_init() — 内部实现"
description: "hash_init() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 356
---

## `hash_init()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:266](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L266) (`lower_hash_init`)
- **函数符号**: `lower_hash_init()`


### Lowering 说明

- 对 `hash_init(algo)` 进行 lowering，并返回装箱的 HashContext 资源。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_init`

## 签名摘要

```php
function hash_init(string $algo, int $flags = 0, string $key = '', array $options = []): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–4 个参数（3 个可选参数）。

## 交叉引用

- [`hash_init()` 用户参考](../../../php/builtins/string/hash_init.md)
