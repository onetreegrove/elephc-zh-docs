---
title: "unserialize() — 内部实现"
description: "unserialize() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 285
---

## `unserialize()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/serialize.rs`:164](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/serialize.rs#L164) (`lower_unserialize`)
- **函数符号**: `lower_unserialize()`


### Lowering 说明

- 将 `unserialize($data, $options?)` lowering 到共享的 unserialize 运行时辅助函数。
- 源字符串由 `__rt_unserialize_mixed` 解析；null 结果指针（解析错误或不支持的 wire form）会被 boxed 为 PHP `false`。可选的 `$options` 参数会被接受，但当前会被忽略。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_mixed_cast_string`
- `__rt_unserialize_begin`
- `__rt_unserialize_mixed`

## 签名摘要

```php
function unserialize(mixed $data, mixed $options): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收 1–2 个参数（1 个可选参数）。

## 交叉引用

- [`unserialize()` 用户参考](../../../php/builtins/misc/unserialize.md)

