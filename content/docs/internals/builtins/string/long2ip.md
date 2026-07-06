---
title: "long2ip() — 内部实现"
description: "long2ip() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 367
---

## `long2ip()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:476](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L476) (`lower_long2ip`)
- **函数符号**: `lower_long2ip()`


### Lowering 说明

- 通过 IPv4 格式化运行时辅助函数对 `long2ip(value)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_ip2long`
- `__rt_long2ip`

## 签名摘要

```php
function long2ip(int $ip): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`long2ip()` 用户参考](../../../php/builtins/string/long2ip.md)
