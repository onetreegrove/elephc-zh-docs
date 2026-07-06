---
title: "gzuncompress() — 内部实现"
description: "gzuncompress() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 349
---

## `gzuncompress()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:457](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L457) (`lower_gzuncompress`)
- **函数符号**: `lower_gzuncompress()`


### Lowering 说明

- 对 `gzuncompress(data, max_length?)` 进行 lowering，并将 zlib 失败 boxed 为 PHP false。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_long2ip`

## 签名摘要

```php
function gzuncompress(string $data, int $max_length): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`gzuncompress()` 用户参考](../../../php/builtins/string/gzuncompress.md)

