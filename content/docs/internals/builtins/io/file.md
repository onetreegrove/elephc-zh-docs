---
title: "file() — 内部实现"
description: "file() 的编译器内部实现：路径 Lowering、类型检查以及运行时辅助函数。"
sidebar:
  order: 159
---

## `file()` — 内部实现

## 实现位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:3685](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3685) (`lower_file`)
- **函数符号**：`lower_file()`

### Lowering 说明

- 通过目标平台感知的运行时行数组（line-array）辅助函数来 Lowering `file(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_file`
- `__rt_realpath`

## 签名摘要

```php
function file(string $filename, int $flags, mixed $context): array
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 3 个参数。

## 交叉引用

- [`file()` 的用户参考](../../../php/builtins/io/file.md)
