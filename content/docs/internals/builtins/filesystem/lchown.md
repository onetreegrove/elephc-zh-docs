---
title: "lchown() — 内部实现"
description: "lchown() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 128
---

## `lchown()` — 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4483](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4483) (`lower_lchown`)
- **函数符号**: `lower_lchown()`


### Lowering 说明

- 对 `lchown(path, owner)` 执行 lowering，以支持整数 UID 和字符串用户名，且不追踪符号链接。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_umask`

## 签名摘要

```php
function lchown(string $filename, int $user): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 2 个参数。

## 交叉引用

- [`lchown()` 的用户参考](../../../php/builtins/filesystem/lchown.md)
