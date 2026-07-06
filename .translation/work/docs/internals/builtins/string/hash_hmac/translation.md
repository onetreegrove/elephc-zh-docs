---
title: "hash_hmac() — 内部实现"
description: "hash_hmac() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 355
---

## `hash_hmac()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:228](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L228) (`lower_hash_hmac`)
- **函数符号**: `lower_hash_hmac()`


### Lowering 说明

- 通过共享的 HMAC 运行时分发器对 `hash_hmac(algo, data, key, binary?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_equals`
- `__rt_hash_hmac`

## 签名摘要

```php
function hash_hmac(string $algo, string $data, string $key, bool $binary): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 3–4 个参数（1 个可选参数）。

## 交叉引用

- [`hash_hmac()` 用户参考](../../../php/builtins/string/hash_hmac.md)
