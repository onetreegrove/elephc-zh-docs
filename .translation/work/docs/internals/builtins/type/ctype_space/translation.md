---
title: "ctype_space() — 内部实现"
description: "ctype_space() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 412
---

## `ctype_space()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/ctype.rs`:35](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/ctype.rs#L35) (`lower_ctype_space`)
- **函数符号**: `lower_ctype_space()`

### Lowering 说明

- 通过检查每个字节是否属于 PHP 的 ASCII 空白字符集合，对 `ctype_space(string)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function ctype_space(string $text): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`ctype_space()` 用户参考](../../../php/builtins/type/ctype_space.md)
