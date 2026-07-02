---
title: "__elephc_phar_set_stub() —— 内部实现"
description: "__elephc_phar_set_stub() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 443
---

## `__elephc_phar_set_stub()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3896](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3896) (`lower_elephc_phar_set_stub`)
- **函数符号**: `lower_elephc_phar_set_stub()`


### Lowering 说明

- 将 `__elephc_phar_set_stub()` 降级为 stub 写入桥接调用。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 是内联的，或者通过另一个内置函数路由。_

## 签名摘要

```php
function __elephc_phar_set_stub(mixed $filename, mixed $stub): bool
```

## 类型检查器约束

- **Arity**: 恰好接受 2 个参数。

## 交叉引用

- _无面向用户的参考 —— 这是一个编译器内部辅助函数。_
