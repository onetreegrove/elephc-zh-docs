---
title: "getprotobynumber() — 内部实现"
description: "getprotobynumber() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 179
---

## `getprotobynumber()` — 内部实现

## 定义位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3467](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3467) (`lower_getprotobynumber`)
- **函数符号**: `lower_getprotobynumber()`


### Lowering 说明

- 将 `getprotobynumber(number)` 进行 Lowering，并将缺失的条目装箱（box）为 PHP `false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getprotobynumber`

## 签名摘要

```php
function getprotobynumber(int $protocol): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 1 个参数。

## 交叉引用

- [`getprotobynumber()` 用户参考手册](../../../php/builtins/io/getprotobynumber.md)
