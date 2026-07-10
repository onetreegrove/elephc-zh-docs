---
title: "readline() — 内部实现"
description: "readline() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 309
---

## `readline()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:310](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L310) (`lower_readline`)
- **函数符号**: `lower_readline()`


### Lowering 说明

- 通过可选地写入提示并读取 stdin，对 `readline(prompt?)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fgets`

## 签名摘要

```php
function readline(string $prompt): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`readline()` 用户参考](../../../php/builtins/process/readline.md)

