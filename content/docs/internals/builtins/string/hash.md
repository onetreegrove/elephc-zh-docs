---
title: "hash() — 内部实现"
description: "hash() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 350
---

## `hash()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:209](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L209) (`lower_hash`)
- **函数符号**: `lower_hash()`


### Lowering 说明

- 通过共享的运行时 digest 分发器对 `hash(algo, data, binary?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash`

## 签名摘要

```php
function hash(string $algo, string $data, bool $binary = false, array $options = []): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–4 个参数（2 个可选参数）。

## 交叉引用

- [`hash()` 用户参考](../../../php/builtins/string/hash.md)
