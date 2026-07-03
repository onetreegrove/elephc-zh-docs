---
title: "is_file() — 内部实现"
description: "is_file() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 122
---

## `is_file()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:5592](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L5592) (`lower_is_file`)
- **函数符号**：`lower_is_file()`


### Lowering 说明

- 通过目标平台感知的运行时 stat 辅助函数对 `is_file(path)` 执行 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_is_dir`
- `__rt_is_readable`
- `__rt_is_writable`

## 签名摘要

```php
function is_file(string $filename): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 1 个参数。

## 交叉引用

- [`is_file()` 用户参考](../../../php/builtins/filesystem/is_file.md)
