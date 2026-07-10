---
title: "fclose() — 内部实现"
description: "fclose() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 152
---

## `fclose()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2707](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2707) (`lower_fclose`)
- **函数符号**: `lower_fclose()`


### Lowering 说明

- 在验证并解包（unboxing）stream 句柄后对 `fclose(stream)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个 builtin。_

## 签名摘要

```php
function fclose(resource $stream): bool
```

## 类型检查器约束

- **Arity**: 只接受 1 个参数。

## 交叉引用

- [`fclose()` 的用户参考](../../../php/builtins/io/fclose.md)
