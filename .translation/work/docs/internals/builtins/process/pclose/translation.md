---
title: "pclose() — 内部实现"
description: "pclose() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 307
---

## `pclose()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3630](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3630) (`lower_pclose`)
- **函数符号**: `lower_pclose()`


### Lowering 说明

- 对 `pclose(handle)` 进行 lowering，并返回子进程状态。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_pclose`

## 签名摘要

```php
function pclose(resource $handle): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`pclose()` 用户参考](../../../php/builtins/process/pclose.md)

