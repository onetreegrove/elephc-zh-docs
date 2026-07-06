---
title: "printf() — 内部实现"
description: "printf() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 373
---

## `printf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:517](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L517) (`lower_printf`)
- **函数符号**: `lower_printf()`

### Lowering 说明

- 将 `printf(format, values...)` lowering 为先执行 `sprintf()`，再输出到 stdout。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sprintf`

## 签名摘要

```php
function printf(string $format, ...$values): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。
- **可变参数 (Variadic)**: 将多余的参数收集到 `$values` 中。

## 交叉引用

- [`printf()` 用户参考](../../../php/builtins/string/printf.md)
