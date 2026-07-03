---
title: "tmpfile() — 内部实现"
description: "tmpfile() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 147
---

## `tmpfile()` — 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:5416](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5416) (`lower_tmpfile`)
- **函数符号**: `lower_tmpfile()`


### Lowering 说明

- lower `tmpfile()` 并装箱匿名流描述符或 PHP false。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_filemtime`
- `__rt_linkinfo`
- `__rt_tmpfile`

## 签名摘要

```php
function tmpfile(): mixed
```

## 类型检查器约束

- **参数数量 (Arity)**: 不接受任何参数。

## 交叉引用

- [`tmpfile()` 用户参考](../../../php/builtins/filesystem/tmpfile.md)
