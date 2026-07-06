---
title: "inet_ntop() — 内部实现"
description: "inet_ntop() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 363
---

## `inet_ntop()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:497](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L497) (`lower_inet`)
- **函数符号**: `lower_inet()`


### Lowering 说明

- 对 `inet_ntop()` 和 `inet_pton()` 进行 lowering，并将无效地址结果装箱为 PHP false。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sprintf`

## 签名摘要

```php
function inet_ntop(string $ip): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`inet_ntop()` 用户参考](../../../php/builtins/string/inet_ntop.md)
