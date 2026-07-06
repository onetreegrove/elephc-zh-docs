---
title: "str_replace() — 内部实现"
description: "str_replace() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 385
---

## `str_replace()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:780](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L780) (`lower_string_replace`)
- **函数符号**: `lower_string_replace()`

### Lowering 说明

- 使用三个字符串操作数对 `str_replace()`/`str_ireplace()` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function str_replace(string $search, string $replace, string $subject, int $count): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 3–4 个参数（1 个可选参数）。
- **按引用传递的参数**: `$count`。

## 交叉引用

- [`str_replace()` 用户参考](../../../php/builtins/string/str_replace.md)
