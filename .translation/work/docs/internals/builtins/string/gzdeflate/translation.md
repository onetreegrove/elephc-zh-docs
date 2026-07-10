---
title: "gzdeflate() — 内部实现"
description: "gzdeflate() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 347
---

## `gzdeflate()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:418](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L418) (`lower_gzdeflate`)
- **函数符号**: `lower_gzdeflate()`


### Lowering 说明

- 通过内联 raw-DEFLATE zlib 调用对 `gzdeflate(data, level?)` 进行 lowering。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数。_

## 签名摘要

```php
function gzdeflate(string $data, int $level, int $encoding): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 2–3 个参数（1 个可选参数）。

## 交叉引用

- [`gzdeflate()` 用户参考](../../../php/builtins/string/gzdeflate.md)

