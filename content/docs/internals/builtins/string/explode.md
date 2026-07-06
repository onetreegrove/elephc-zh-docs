---
title: "explode() — 内部实现"
description: "explode() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 344
---

## `explode()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:151](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L151) (`lower_explode`)
- **函数符号**: `lower_explode()`


### Lowering 说明

- 将 `explode(delimiter, string)` lowering 到共享的 string-array splitter 辅助函数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_explode`
- `__rt_sscanf`

## 签名摘要

```php
function explode(string $separator, string $string, int $limit): array
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–3 个参数（1 个可选参数）。

## 交叉引用

- [`explode()` 用户参考](../../../php/builtins/string/explode.md)

