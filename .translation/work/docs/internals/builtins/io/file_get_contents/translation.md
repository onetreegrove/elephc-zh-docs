---
title: "file_get_contents() —— 内部实现"
description: "file_get_contents() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 160
---

## `file_get_contents()` —— 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:39](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L39) (`lower_file_get_contents`)
- **函数符号**: `lower_file_get_contents()`


### Lowering 说明

- 对 `file_get_contents(path)` 进行 lowering，并对运行时的 string-or-false 结果进行装箱（box）。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_file_get_contents_maybe_url`
- `__rt_php_input`

## 签名摘要

```php
function file_get_contents(string $filename, bool $use_include_path, mixed $context, int $offset, int $length): mixed
```

## 类型检查器约束

- **参数个数 (Arity)**: 恰好接受 5 个参数。

## 交叉引用

- [`file_get_contents()` 用户参考](../../../php/builtins/io/file_get_contents.md)
