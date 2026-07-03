---
title: "file_put_contents() —— 内部实现"
description: "file_put_contents() 的编译器内部实现：lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 161
---

## `file_put_contents()` —— 内部实现

## 源码位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:3727](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3727) (`lower_file_put_contents`)
- **函数符号**: `lower_file_put_contents()`


### Lowering 说明

- 通过目标感知的运行时写入器对 `file_put_contents(path, data)` 进行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_file_put_contents`
- `__rt_file_put_contents_maybe_phar`

## 签名摘要

```php
function file_put_contents(string $filename, mixed $data, int $flags = 0, mixed $context = null): int
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 2–4 个参数（其中 2 个为可选参数）。

## 交叉引用

- [`file_put_contents()` 用户参考](../../../php/builtins/io/file_put_contents.md)
