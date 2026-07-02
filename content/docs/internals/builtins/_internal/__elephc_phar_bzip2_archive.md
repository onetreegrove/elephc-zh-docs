---
title: "__elephc_phar_bzip2_archive() —— 内部实现"
description: "__elephc_phar_bzip2_archive() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 431
---

## `__elephc_phar_bzip2_archive()` —— 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4120](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4120) (`lower_elephc_phar_bzip2_archive`)
- **函数符号**：`lower_elephc_phar_bzip2_archive()`


### Lowering 说明

- 将 `__elephc_phar_bzip2_archive(src)` 降级（lower）为整包 bzip2 桥接，
- 返回写入的目标路径（失败时返回空字符串）。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 降级过程是内联的，或者路由通过另一个内置函数。_

## 签名摘要

```php
function __elephc_phar_bzip2_archive(mixed $src): string
```

## 类型检查器约束

- **参数个数（Arity）**：仅接受 1 个参数。

## 交叉引用

- _无面向用户的引用 —— 这是一个编译器内部辅助函数。_
