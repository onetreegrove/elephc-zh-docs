---
title: "hash_equals() — 内部实现"
description: "hash_equals() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 353
---

## `hash_equals()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:247](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L247) (`lower_hash_equals`)
- **函数符号**: `lower_hash_equals()`


### Lowering 说明

- 通过时间安全的运行时比较辅助函数对 `hash_equals(known, user)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_algos_list`
- `__rt_hash_equals`
- `__rt_hash_init`

## 签名摘要

```php
function hash_equals(string $known_string, string $user_string): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`hash_equals()` 用户参考](../../../php/builtins/string/hash_equals.md)
