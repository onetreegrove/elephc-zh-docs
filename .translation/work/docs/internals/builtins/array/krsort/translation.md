---
title: "krsort() — 内部实现"
description: "krsort() 的编译器内部实现：Lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 51
---

## `krsort()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/arrays.rs`:1101](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/arrays.rs#L1101) (`lower_krsort`)
- **函数符号**: `lower_krsort()`


### Lowering 说明

- 通过旧版的逆向键排序（reverse key-sort）辅助接口，实现 `krsort()` 的 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_krsort`
- `__rt_natcasesort`
- `__rt_natsort`

## 签名摘要

```php
function krsort(array $array, int $flags): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 2 个参数。
- **按引用传递的参数**: `$array`。

## 交叉引用

- [krsort() 用户参考文档](../../../php/builtins/array/krsort.md)
