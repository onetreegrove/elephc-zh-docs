---
title: "shell_exec() — 内部实现"
description: "shell_exec() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 310
---

## `shell_exec()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:698](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L698) (`lower_shell_exec`)
- **函数符号**: `lower_shell_exec()`


### Lowering 说明

- 通过共享运行时辅助函数捕获 shell stdout，对 `shell_exec(command)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function shell_exec(string $command): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`shell_exec()` 用户参考](../../../php/builtins/process/shell_exec.md)

