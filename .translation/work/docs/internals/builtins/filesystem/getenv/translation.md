---
title: "getenv() — 内部实现"
description: "getenv() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 118
---

## `getenv()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:645](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L645) (`lower_getenv`)
- **函数符号**: `lower_getenv()`


### Lowering 说明

- 通过感知目标平台的内部环境查找辅助函数对 `getenv(name)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getenv`

## 签名摘要

```php
function getenv(string $name, bool $local_only): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。

## 交叉引用

- [`getenv()` 用户参考](../../../php/builtins/filesystem/getenv.md)
