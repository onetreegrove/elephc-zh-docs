---
title: "json_encode() — 内部实现"
description: "json_encode() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 229
---

## `json_encode()` —— 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/json.rs`:52](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/json.rs#L52) (`lower_json_encode`)
- **函数符号**：`lower_json_encode()`


### Lowering 说明

- 通过共享的 JSON 编码器运行时对 `json_encode(value, flags?, depth?)` 进行 Lowering 转换。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 转换已被内联，或通过另一个 builtin 进行路由。_

## 签名摘要

```php
function json_encode(mixed $value, int $flags, int $depth): string
```

## 类型检查器约束

- **参数数量**：接受 1–3 个参数（其中 2 个可选）。

## 交叉引用

- [`json_encode()` 的用户参考](../../../php/builtins/json/json_encode.md)
