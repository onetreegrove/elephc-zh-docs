---
title: "json_last_error() — 内部实现"
description: "json_last_error() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 230
---

## `json_last_error()` —— 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/json.rs`:70](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/json.rs#L70) (`lower_json_last_error`)
- **函数符号**：`lower_json_last_error()`


### Lowering 说明

- 通过读取共享的运行时错误码符号对 `json_last_error()` 进行 Lowering 转换。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_json_last_error_msg`

## 签名摘要

```php
function json_last_error(): int
```

## 类型检查器约束

- **参数数量**：不接受任何参数。

## 交叉引用

- [`json_last_error()` 的用户参考](../../../php/builtins/json/json_last_error.md)
