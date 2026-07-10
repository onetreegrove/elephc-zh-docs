---
title: "crc32() — 内部实现"
description: "crc32() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 343
---

## `crc32()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:348](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L348) (`lower_crc32`)
- **函数符号**: `lower_crc32()`


### Lowering 说明

- 通过共享 checksum 运行时辅助函数对 `crc32(string)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_crc32`
- `__rt_hash`
- `__rt_md5`
- `__rt_sha1`

## 签名摘要

```php
function crc32(string $string): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`crc32()` 用户参考](../../../php/builtins/string/crc32.md)

