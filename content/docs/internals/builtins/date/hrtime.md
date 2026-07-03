---
title: "hrtime() — 内部实现"
description: "hrtime() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 90
---

## `hrtime()` —— 内部实现

## 所在位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:247](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L247) (`lower_hrtime`)
- **函数符号**: `lower_hrtime()`


### Lowering 说明

- 通过单调时钟（monotonic-clock）运行时辅助函数对 `hrtime([$as_number])` 进行 Lowering。
- `__rt_hrtime` 从整数结果寄存器（`x0`/`rax`）读取 as-number 标志并返回
- 一个已装箱的 `Mixed` 结果 —— 当该标志为 `0`/false 时为装箱的 `[sec, nsec]` 数组，或者为
- 真值（truthy）时为装箱的纳秒整数 —— 因此调用后不需要进行装箱。与时间戳
- 内建函数不同，省略参数时的默认值是 `0`（数组形式），而不是 `-1` 当前时间哨兵。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hrtime`
- `__rt_http_response_code`

## 签名摘要

```php
function hrtime(bool $as_number): mixed
```

## 类型检查器约束

- **参数数量（Arity）**: 接受 0–1 个参数（1 个可选参数）。

## 交叉引用

- [`hrtime()` 用户参考](../../../php/builtins/date/hrtime.md)
