---
title: "microtime() — 内部实现"
description: "microtime() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 92
---

## `microtime()` —— 内部实现

## 所在位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:111](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L111) (`lower_microtime`)
- **函数符号**: `lower_microtime()`


### Lowering 说明

- 对 `microtime()` / `microtime(true)` / `microtime(false)` / `microtime($flag)` 进行 Lowering。
- 分发由 `ir_lower` 中设置的参数感知结果类型驱动（参见
- `call_return_type_for_args` 以及 `call_return_type` 中的 `microtime` 回退机制）：
- `Float`（字面量 `true`）调用现有的 `__rt_microtime` 浮点数辅助函数；`Str`
- （省略参数 / 字面量 `false`）调用 `__rt_microtime_str`，后者构建
- 栈上的 "0.NNNNNNNN sec" 字符串并将其持久化；`Mixed`（非字面量标志）
- 封送（marshal）该标志并调用 `__rt_microtime_mixed`，后者在运行时进行分支并
- 装箱（box）该字符串或浮点数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_microtime`
- `__rt_microtime_mixed`
- `__rt_microtime_str`

## 签名摘要

```php
function microtime(bool $as_float): int
```

## 类型检查器约束

- **参数数量（Arity）**: 接受 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`microtime()` 用户参考](../../../php/builtins/date/microtime.md)
