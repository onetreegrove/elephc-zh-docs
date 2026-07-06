---
title: "sha1() — 内部实现"
description: "sha1() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 377
---

## `sha1()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:360](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L360) (`lower_sha1`)
- **函数符号**: `lower_sha1()`

### Lowering 说明

- 通过共享的 crypto-backed 运行时辅助函数对 `sha1(data, binary?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hash`
- `__rt_sha1`

## 签名摘要

```php
function sha1(string $string, bool $binary): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`sha1()` 用户参考](../../../php/builtins/string/sha1.md)
