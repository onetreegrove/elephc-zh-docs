---
title: "popen() — 内部实现"
description: "popen() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 308
---

## `popen()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3602](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3602) (`lower_popen`)
- **函数符号**: `lower_popen()`


### Lowering 说明

- 对 `popen(command, mode)` 进行 lowering，并将进程管道 boxed 为 `resource|false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_popen`

## 签名摘要

```php
function popen(string $command, string $mode): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。

## 交叉引用

- [`popen()` 用户参考](../../../php/builtins/process/popen.md)

