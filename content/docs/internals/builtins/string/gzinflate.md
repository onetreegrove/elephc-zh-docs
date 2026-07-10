---
title: "gzinflate() — 内部实现"
description: "gzinflate() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 348
---

## `gzinflate()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:436](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L436) (`lower_gzinflate`)
- **函数符号**: `lower_gzinflate()`


### Lowering 说明

- 对 `gzinflate(data, max_length?)` 进行 lowering，并将 zlib 失败 boxed 为 PHP false。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function gzinflate(string $data, int $max_length): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`gzinflate()` 用户参考](../../../php/builtins/string/gzinflate.md)

