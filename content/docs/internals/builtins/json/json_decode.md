---
title: "json_decode() — 内部实现"
description: "json_decode() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 228
---

## `json_decode()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/json.rs`:30](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/json.rs#L30) (`lower_json_decode`)
- **函数符号**: `lower_json_decode()`


### Lowering 说明

- 通过共享的 JSON 解码器运行时来 lowering `json_decode(json, associative?, depth?, flags?)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_json_decode_mixed`

## 签名摘要

```php
function json_decode(string $json, bool $associative, int $depth, int $flags): mixed
```

## 类型检查器强制执行的规则

- **参数个数**: 接受 1–4 个参数（3 个可选）。

## 交叉引用

- [`json_decode()` 用户参考](../../../php/builtins/json/json_decode.md)
