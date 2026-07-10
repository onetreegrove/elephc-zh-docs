---
title: "usleep() — 内部实现"
description: "usleep() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 313
---

## `usleep()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:625](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L625) (`lower_usleep`)
- **函数符号**: `lower_usleep()`


### Lowering 说明

- 通过目标平台的 C 库符号对 `usleep(microseconds)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getenv`

## 签名摘要

```php
function usleep(int $microseconds): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`usleep()` 用户参考](../../../php/builtins/process/usleep.md)

