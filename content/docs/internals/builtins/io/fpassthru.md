---
title: "fpassthru() —— 内部实现"
description: "fpassthru() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 164
---

## `fpassthru()` —— 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3027](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3027) (`lower_fpassthru`)
- **函数符号**: `lower_fpassthru()`


### Lowering 说明

- 通过剩余字节流运行时辅助函数（remaining-bytes stream runtime helper）对 `fpassthru(stream)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_feof`
- `__rt_fpassthru`

## 签名摘要

```php
function fpassthru(resource $stream): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`fpassthru()` 用户参考](../../../php/builtins/io/fpassthru.md)
