---
title: "stream_get_meta_data() — 内部实现"
description: "stream_get_meta_data() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 202
---

## `stream_get_meta_data()` — 内部实现

## 源码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:1446](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L1446) (`lower_stream_get_meta_data`)
- **函数符号**：`lower_stream_get_meta_data()`


### Lowering 说明

- 通过 metadata 运行时辅助函数对 `stream_get_meta_data(stream)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_stream_get_meta_data`

## 签名摘要

```php
function stream_get_meta_data(resource $stream): array
```

## 类型检查器约束

- **参数个数 (Arity)**：仅接受 1 个参数。

## 交叉引用

- [`stream_get_meta_data()` 用户参考文档](../../../php/builtins/io/stream_get_meta_data.md)
