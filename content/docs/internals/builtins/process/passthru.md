---
title: "passthru() — 内部实现"
description: "passthru() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 306
---

## `passthru()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:714](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L714) (`lower_passthru`)
- **函数符号**: `lower_passthru()`


### Lowering 说明

- 通过 libc `system()` 直接透传 stdout，对 `passthru(command)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_cstr`
- `__rt_shell_exec`

## 签名摘要

```php
function passthru(string $command, int $result_code): void
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 2 个参数。
- **引用传递参数**: `$result_code`。

## 交叉引用

- [`passthru()` 用户参考](../../../php/builtins/process/passthru.md)

