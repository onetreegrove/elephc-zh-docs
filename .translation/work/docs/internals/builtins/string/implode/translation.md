---
title: "implode() — 内部实现"
description: "implode() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 362
---

## `implode()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:192](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L192) (`lower_implode`)
- **函数符号**: `lower_implode()`


### Lowering 说明

- 通过选择字符串或整数数组辅助函数对 `implode(glue, array)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function implode(string $separator, array $array): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`implode()` 用户参考](../../../php/builtins/string/implode.md)
