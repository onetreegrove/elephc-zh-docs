---
title: "grapheme_strrev() — 内部实现"
description: "grapheme_strrev() 的编译器内部实现：lowering 路径、类型检查与运行时辅助函数。"
sidebar:
  order: 345
---

## `grapheme_strrev()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/strings.rs`:88](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/strings.rs#L88) (`lower_grapheme_strrev`)
- **函数符号**: `lower_grapheme_strrev()`


### Lowering 说明

- 对 `grapheme_strrev()` 进行 lowering，并将其 `string|false` 结果 boxed 为 `Mixed`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_grapheme_strrev`
- `__rt_strcopy`

## 签名摘要

```php
function grapheme_strrev(string $string): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 接收且仅接收 1 个参数。

## 交叉引用

- [`grapheme_strrev()` 用户参考](../../../php/builtins/string/grapheme_strrev.md)

