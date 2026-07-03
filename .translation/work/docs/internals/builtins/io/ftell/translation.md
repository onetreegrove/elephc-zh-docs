---
title: "ftell() — 内部实现"
description: "ftell() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 172
---

## `ftell()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:3133](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3133) (`lower_ftell`)
- **函数符号**：`lower_ftell()`


### Lowering 说明

- 将 `ftell(stream)` lowering 为 `lseek(fd, 0, SEEK_CUR)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- __rt_user_wrapper_ftell

## 签名摘要

```php
function ftell(resource $stream): int
```

## 类型检查器执行的检查

- **参数数量**：精确接收 1 个参数。

## 交叉引用

- [`ftell()` 的用户参考](../../../php/builtins/io/ftell.md)
