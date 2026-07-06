---
title: "hash_update() — 内部实现"
description: "hash_update() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 357
---

## `hash_update()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:277](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L277) (`lower_hash_update`)
- **函数符号**: `lower_hash_update()`


### Lowering 说明

- 通过增量 hash 运行时辅助函数对 `hash_update(context, data)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_update`

## 签名摘要

```php
function hash_update(resource $context, string $data): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`hash_update()` 用户参考](../../../php/builtins/string/hash_update.md)
