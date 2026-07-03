---
title: "gethostbyname() — 内部实现"
description: "gethostbyname() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 176
---

## `gethostbyname()` — 内部实现

## 所在位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:3419](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3419) (`lower_gethostbyname`)
- **函数符号**：`lower_gethostbyname()`


### Lowering 说明

- 通过共享的运行时解析器 lower `gethostbyname(hostname)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_gethostbyaddr`
- `__rt_gethostbyname`

## 签名摘要

```php
function gethostbyname(string $hostname): string
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`gethostbyname()` 用户参考](../../../php/builtins/io/gethostbyname.md)
