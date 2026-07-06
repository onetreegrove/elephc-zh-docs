---
title: "http_response_code() — 内部实现"
description: "http_response_code() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 279
---

## `http_response_code()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:264](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L264) (`lower_http_response_code`)
- **函数符号**: `lower_http_response_code()`


### Lowering 说明

- 将 `http_response_code([$code])` lowering 到 `__rt_http_response_code`。状态码（或者省略时用于“读取当前值”的 0）会进入第一个整数参数寄存器；该例程返回得到的状态码 int。PHP 语义（读取还是设置、返回旧值）位于 bridge 的 `elephc_web_set_status` 中。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_header`
- `__rt_http_response_code`

## 签名摘要

```php
function http_response_code(mixed $response_code): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`http_response_code()` 用户参考](../../../php/builtins/misc/http_response_code.md)

