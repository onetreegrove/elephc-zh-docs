---
title: "sprintf() — 内部实现"
description: "sprintf() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 378
---

## `sprintf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:511](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L511) (`lower_sprintf`)
- **函数符号**: `lower_sprintf()`

### Lowering 说明

- 通过为 `__rt_sprintf` 打包可变参数记录，对 `sprintf(format, values...)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sprintf`

## 签名摘要

```php
function sprintf(string $format, ...$values): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$values` 中。

## 交叉引用

- [`sprintf()` 用户参考](../../../php/builtins/string/sprintf.md)
