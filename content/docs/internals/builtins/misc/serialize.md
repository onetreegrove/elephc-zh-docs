---
title: "serialize() — 内部实现"
description: "serialize() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 284
---

## `serialize()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/serialize.rs`:33](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/serialize.rs#L33) (`lower_serialize`)
- **函数符号**: `lower_serialize()`


### Lowering 说明

- 将 `serialize($value)` lowering 到共享的 serialize 运行时辅助函数。
- 标量静态类型会直接通过 `__rt_serialize_value` 格式化；Mixed/Union 参数会先 unbox，再由 `__rt_serialize_mixed` 分派。
- 非标量静态类型（数组/对象）尚不支持，并会被拒绝。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_serialize_begin`
- `__rt_serialize_mixed`
- `__rt_serialize_value`

## 签名摘要

```php
function serialize(mixed $value): string
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`serialize()` 用户参考](../../../php/builtins/misc/serialize.md)

