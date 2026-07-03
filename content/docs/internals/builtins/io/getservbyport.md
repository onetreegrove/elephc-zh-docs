---
title: "getservbyport() —— 内部实现"
description: "getservbyport() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 181
---

## `getservbyport()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3517](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3517) (`lower_getservbyport`)
- **函数符号**: `lower_getservbyport()`


### Lowering 说明

- 将 `getservbyport(port, protocol)` 进行 Lowering 处理，并将缺失的条目装箱（box）为 PHP 的 `false`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getservbyport`

## 签名摘要

```php
function getservbyport(int $port, string $protocol): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**：接受恰好 2 个参数。

## 交叉引用

- [`getservbyport()` 用户参考](../../../php/builtins/io/getservbyport.md)
