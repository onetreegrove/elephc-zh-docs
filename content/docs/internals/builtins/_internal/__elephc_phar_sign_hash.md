---
title: "__elephc_phar_sign_hash() — 内部实现"
description: "__elephc_phar_sign_hash() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 445
---

## `__elephc_phar_sign_hash()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4163](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4163) (`lower_elephc_phar_sign_hash`)
- **函数符号**: `lower_elephc_phar_sign_hash()`


### Lowering 说明

- 将 `__elephc_phar_sign_hash(path, algo)` lowering 到基于哈希的签名桥。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— 其 lowering 被内联或路由到另一个 builtin。_

## 签名摘要

```php
function __elephc_phar_sign_hash(mixed $path, mixed $algo): bool
```

## 类型检查器强制执行的规则

- **参数个数**: 恰好接受 2 个参数。

## 交叉引用

- _无面向用户的参考文档 —— 这是编译器内部辅助函数。_
