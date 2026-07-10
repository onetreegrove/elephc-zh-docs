---
title: "scandir() — 内部实现"
description: "scandir() 的编译器内部实现：lower 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 142
---

## `scandir()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:4458](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4458) (`lower_scandir`)
- **函数符号**：`lower_scandir()`


### Lowering 说明

- 通过感知目标平台的运行时目录列表辅助函数来 lower `scandir(path)`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_glob`
- `__rt_scandir`

## 签名摘要

```php
function scandir(string $directory, int $sorting_order, mixed $context): array
```

## 类型检查器约束

- **Arity**：恰好接受 3 个参数。

## 交叉引用

- [`scandir()` 用户参考](../../../php/builtins/filesystem/scandir.md)
