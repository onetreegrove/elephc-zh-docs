---
title: "lcfirst() — 内部实现"
description: "lcfirst() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 366
---

## `lcfirst()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:104](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L104) (`lower_lcfirst`)
- **函数符号**: `lower_lcfirst()`


### Lowering 说明

- 通过复制字符串并将第一个 ASCII 字节转为小写，对 `lcfirst()` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_strcopy`

## 签名摘要

```php
function lcfirst(string $string): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`lcfirst()` 用户参考](../../../php/builtins/string/lcfirst.md)
