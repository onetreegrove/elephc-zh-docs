---
title: "umask() — 内部实现"
description: "umask() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 149
---

## `umask()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4493](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4493) (`lower_umask`)
- **函数符号**: `lower_umask()`


### Lowering 说明

- 通过目标平台感知的运行时辅助函数对 `umask(mask?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_umask`

## 签名摘要

```php
function umask(int $mask): int
```

## 类型检查器约束

- **参数个数 (Arity)**：接受 0–1 个参数（1 个可选）。

## 交叉引用

- [`umask()` 用户参考](../../../php/builtins/filesystem/umask.md)
