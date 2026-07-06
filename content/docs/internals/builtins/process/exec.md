---
title: "exec() — 内部实现"
description: "exec() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 304
---

## `exec()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:690](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L690) (`lower_exec`)
- **函数符号**: `lower_exec()`


### Lowering 说明

- 通过共享运行时辅助函数捕获 shell stdout，对 `exec(command)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function exec(string $command, array $output, int $result_code): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 3 个参数。
- **引用传递参数**: `$output`, `$result_code`。

## 交叉引用

- [`exec()` 用户参考](../../../php/builtins/process/exec.md)

