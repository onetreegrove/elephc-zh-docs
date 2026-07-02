---
title: "__elephc_phar_gzip_archive() — internals"
description: "__elephc_phar_gzip_archive() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 438
---

## `__elephc_phar_gzip_archive()` — 内部实现

## 定义与实现位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4105](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4105) (`lower_elephc_phar_gzip_archive`)
- **函数符号**: `lower_elephc_phar_gzip_archive()`


### Lowering 说明

- 将 `__elephc_phar_gzip_archive(src)` lowering 为整个归档的 gzip 桥接，
- 并返回写入的目标路径（失败时返回空字符串）。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数（builtin）。_

## 签名摘要

```php
function __elephc_phar_gzip_archive(mixed $src): string
```

## 类型检查器强制约束

- **参数个数（Arity）**: 仅接受 1 个参数。

## 交叉引用

- _无面向用户的引用 —— 这是一个编译器内部辅助函数。_
