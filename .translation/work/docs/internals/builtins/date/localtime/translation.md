---
title: "localtime() — 内部实现"
description: "localtime() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 91
---

## `localtime()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:220](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L220) (`lower_localtime`)
- **函数符号**: `lower_localtime()`


### Lowering 说明

- 通过共享的分解（decomposition）运行时辅助函数对 `localtime([$timestamp[, $associative]])` 进行 Lowering。
- `__rt_localtime` 从整数结果寄存器（`x0`/`rax`）读取时间戳，并从第二个参数寄存器（`x1`/`rsi`）读取关联键标志 —— 这是一个不规则的 ABI，因此这两个值会被暂存在 scratch 中（该标志在对 `Mixed` 进行拆箱时可能会覆盖时间戳），然后在没有中间调用的情况下被重新加载到它们各自的寄存器中，最后返回的哈希指针会像 `getdate` 一样被装箱到 `Mixed` 关联数组单元中。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_hrtime`
- `__rt_localtime`

## 签名摘要

```php
function localtime(int $timestamp, bool $associative): array
```

## 类型检查器约束

- **参数数量（Arity）**: 接受 0–2 个参数（2 个可选参数）。

## 交叉引用

- [`localtime()` 用户参考](../../../php/builtins/date/localtime.md)
