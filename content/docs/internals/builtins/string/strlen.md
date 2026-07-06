---
title: "strlen() — 内部实现"
description: "strlen() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 391
---

## `strlen()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:1013](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L1013) (`lower_strlen`)
- **函数符号**: `lower_strlen()`

### Lowering 说明

- 通过强制转换类字符串值并返回字节长度，对 `strlen()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_cast_string`

## 签名摘要

```php
function strlen(string $string): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`strlen()` 用户参考](../../../php/builtins/string/strlen.md)
