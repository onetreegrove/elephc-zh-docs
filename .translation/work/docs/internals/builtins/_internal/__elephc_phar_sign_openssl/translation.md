---
title: "__elephc_phar_sign_openssl() — 内部实现"
description: "__elephc_phar_sign_openssl() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 446
---

## `__elephc_phar_sign_openssl()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4149](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4149) (`lower_elephc_phar_sign_openssl`)
- **函数符号**: `lower_elephc_phar_sign_openssl()`


### Lowering 说明

- 将 `__elephc_phar_sign_openssl(path, keyPem)` lowering 为 RSA-SHA1 签名桥。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 过程已内联，或者路由到了其他内置函数。_

## 签名摘要

```php
function __elephc_phar_sign_openssl(mixed $path, mixed $key): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- _无面向用户的引用 —— 这是一个编译器内部的辅助函数。_
