---
title: "gethostname() — 内部实现"
description: "gethostname() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 177
---

## `gethostname()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3409](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3409) (`lower_gethostname`)
- **函数符号**: `lower_gethostname()`


### Lowering 说明

- 通过共享的运行时辅助函数对 `gethostname()` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_gethostbyaddr`
- `__rt_gethostbyname`
- `__rt_gethostname`

## 签名摘要

```php
function gethostname(): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 不接受参数。

## 交叉引用

- [`gethostname()` 用户参考](../../../php/builtins/io/gethostname.md)
