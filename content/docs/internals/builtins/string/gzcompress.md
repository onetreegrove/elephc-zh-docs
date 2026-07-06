---
title: "gzcompress() — 内部实现"
description: "gzcompress() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 346
---

## `gzcompress()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:402](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L402) (`lower_gzcompress`)
- **函数符号**: `lower_gzcompress()`


### Lowering 说明

- 通过内联 zlib `compress2` 调用对 `gzcompress(data, level?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function gzcompress(string $data, int $level, int $encoding): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–3 个参数（1 个可选参数）。

## 交叉引用

- [`gzcompress()` 用户参考](../../../php/builtins/string/gzcompress.md)

