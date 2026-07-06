---
title: "vprintf() — 内部实现"
description: "vprintf() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 405
---

## `vprintf()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:530](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L530) (`lower_vprintf`)
- **函数符号**: `lower_vprintf()`

### Lowering 说明

- 将 `vprintf(format, values)` lowering 为先执行 `vsprintf()`，再输出到 stdout。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_sprintf`

## 签名摘要

```php
function vprintf(string $format, array $values): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`vprintf()` 用户参考](../../../php/builtins/string/vprintf.md)
