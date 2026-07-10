---
title: "fread() — 内部实现"
description: "fread() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 167
---

## `fread()` — 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2816](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2816) (`lower_fread`)
- **函数符号**: `lower_fread()`


### Lowering 说明

- 使用共享的运行时文件读取辅助函数 lower `fread(stream, length)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fread`

## 签名摘要

```php
function fread(resource $stream, int $length): string
```

## 类型检查器约束

- **参数个数 (Arity)**：必须且仅接受 2 个参数。

## 交叉引用

- [`fread()` 的用户参考](../../../php/builtins/io/fread.md)
