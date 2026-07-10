---
title: "time() —— 内部实现"
description: "time() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 95
---

## `time()` —— 内部实现

## 代码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:615](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L615) (`lower_time`)
- **函数符号**: `lower_time()`


### Lowering 说明

- 通过共享的挂钟（wall-clock）运行时辅助函数来 lower `time()`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_time`

## 签名摘要

```php
function time(): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接受任何参数。

## 交叉引用

- [time() 的用户参考文档](../../../php/builtins/date/time.md)
