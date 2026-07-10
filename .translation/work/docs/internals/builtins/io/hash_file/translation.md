---
title: "hash_file() —— 内部实现"
description: "hash_file() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 182
---

## `hash_file()` —— 内部实现

## 实现位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:287](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L287) (`lower_hash_file`)
- **函数符号**：`lower_hash_file()`


### Lowering 说明

- 通过读取字节然后对其进行哈希，来 lower `hash_file(algo, filename, binary?)`。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 其 lowering 过程是内联的，或者通过另一个内置函数进行路由。_

## 签名摘要

```php
function hash_file(string $algo, string $filename, bool $binary = false, array $options = []): mixed
```

## 类型检查器约束

- **参数个数（Arity）**：接受 2–4 个参数（其中 2 个为可选参数）。

## 交叉引用

- [`hash_file()` 的用户参考](../../../php/builtins/io/hash_file.md)
