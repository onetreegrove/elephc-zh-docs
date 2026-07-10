---
title: "sleep() — 内部实现"
description: "sleep() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 311
---

## `sleep()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:473](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L473) (`lower_sleep`)
- **函数符号**: `lower_sleep()`


### Lowering 说明

- 通过目标平台的 C 库符号对 `sleep(seconds)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_strtotime`

## 签名摘要

```php
function sleep(int $seconds): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`sleep()` 用户参考](../../../php/builtins/process/sleep.md)

