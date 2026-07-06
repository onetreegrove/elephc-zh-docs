---
title: "ctype_alnum() — 内部实现"
description: "ctype_alnum() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 409
---

## `ctype_alnum()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/ctype.rs`:30](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/ctype.rs#L30) (`lower_ctype_alnum`)
- **函数符号**: `lower_ctype_alnum()`

### Lowering 说明

- 通过检查每个字节是否落在 ASCII 字母或数字范围内，对 `ctype_alnum(string)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function ctype_alnum(string $text): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`ctype_alnum()` 用户参考](../../../php/builtins/type/ctype_alnum.md)
