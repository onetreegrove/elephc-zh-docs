---
title: "system() — 内部实现"
description: "system() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 312
---

## `system()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:706](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L706) (`lower_system`)
- **函数符号**: `lower_system()`


### Lowering 说明

- 通过 libc `system()` 对 `system(command)` 进行 lowering，并返回旧版空字符串结果。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_shell_exec`

## 签名摘要

```php
function system(string $command, int $result_code): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。
- **引用传递参数**: `$result_code`。

## 交叉引用

- [`system()` 用户参考](../../../php/builtins/process/system.md)

