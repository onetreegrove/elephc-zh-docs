---
title: "hash_algos() — 内部实现"
description: "hash_algos() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 351
---

## `hash_algos()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:254](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L254) (`lower_hash_algos`)
- **函数符号**: `lower_hash_algos()`


### Lowering 说明

- 通过运行时算法列表 builder 对 `hash_algos()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash_algos_list`
- `__rt_hash_init`

## 签名摘要

```php
function hash_algos(): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接收参数。

## 交叉引用

- [`hash_algos()` 用户参考](../../../php/builtins/string/hash_algos.md)

