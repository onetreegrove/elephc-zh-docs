---
title: "gethostbyaddr() — 内部实现"
description: "gethostbyaddr() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 175
---

## `gethostbyaddr()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3431](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3431) (`lower_gethostbyaddr`)
- **函数符号**: `lower_gethostbyaddr()`


### Lowering 说明

- 对 `gethostbyaddr(address)` 进行 lowering，并将格式错误的地址装箱为 PHP `false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_gethostbyaddr`
- `__rt_getprotobyname`

## 签名摘要

```php
function gethostbyaddr(string $ip): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 仅接受 1 个参数。

## 交叉引用

- [`gethostbyaddr()` 用户参考手册](../../../php/builtins/io/gethostbyaddr.md)
