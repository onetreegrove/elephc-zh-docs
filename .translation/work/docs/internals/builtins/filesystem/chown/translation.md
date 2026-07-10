---
title: "chown() — 内部实现"
description: "chown() 的编译器内部实现：lowering 过程、类型检查和运行时辅助函数。"
sidebar:
  order: 100
---

## `chown()` — 内部实现

## 实现位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4473](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4473) (`lower_chown`)
- **函数符号**：`lower_chown()`


### Lowering 说明

- 针对整数 UID 和字符串用户名 lower `chown(path, owner)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_umask`

## 签名摘要

```php
function chown(string $filename, int $user): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 2 个参数。

## 交叉引用

- [`chown()` 用户参考](../../../php/builtins/filesystem/chown.md)
