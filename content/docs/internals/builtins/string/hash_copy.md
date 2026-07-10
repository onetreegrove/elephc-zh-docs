---
title: "hash_copy() — 内部实现"
description: "hash_copy() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 352
---

## `hash_copy()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:333](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L333) (`lower_hash_copy`)
- **函数符号**: `lower_hash_copy()`


### Lowering 说明

- 通过增量 hash clone 辅助函数对 `hash_copy(context)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_crc32`
- `__rt_hash_copy`
- `__rt_md5`
- `__rt_sha1`

## 签名摘要

```php
function hash_copy(resource $context): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`hash_copy()` 用户参考](../../../php/builtins/string/hash_copy.md)

