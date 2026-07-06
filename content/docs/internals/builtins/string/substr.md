---
title: "substr() — 内部实现"
description: "substr() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 398
---

## `substr()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:713](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L713) (`lower_substr`)
- **函数符号**: `lower_substr()`

### Lowering 说明

- 使用目标平台本地的指针算术对 `substr(string, offset, length?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_substr_replace`

## 签名摘要

```php
function substr(string $string, int $offset, int $length): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–3 个参数（1 个可选参数）。

## 交叉引用

- [`substr()` 用户参考](../../../php/builtins/string/substr.md)
