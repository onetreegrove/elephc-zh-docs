---
title: "json_validate() — 内部实现"
description: "json_validate() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 232
---

## `json_validate()` — 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/json.rs`:95](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/json.rs#L95) (`lower_json_validate`)
- **函数符号**: `lower_json_validate()`


### Lowering 说明

- 将 `json_validate(json, depth?, flags?)` lowering 至共享的验证器运行时。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_json_validate`

## 签名摘要

```php
function json_validate(string $json, int $depth, int $flags): bool
```

## 类型检查器约束

- **参数数量**: 接受 1–3 个参数（其中 2 个可选）。

## 交叉引用

- [`json_validate()` 的用户参考文档](../../../php/builtins/json/json_validate.md)
