---
title: "ip2long() — 内部实现"
description: "ip2long() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 365
---

## `ip2long()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:488](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L488) (`lower_ip2long`)
- **函数符号**: `lower_ip2long()`


### Lowering 说明

- 对 `ip2long(string)` 进行 lowering，并将无效地址结果装箱为 PHP false。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_ip2long`
- `__rt_sprintf`

## 签名摘要

```php
function ip2long(string $ip): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`ip2long()` 用户参考](../../../php/builtins/string/ip2long.md)
