---
title: "touch() — 内部实现"
description: "touch() 的编译器内部实现：lowering 路径、类型检查和运行时辅助程序。"
sidebar:
  order: 148
---

## `touch()` — 内部实现

## 代码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4523](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4523) (`lower_touch`)
- **函数符号**: `lower_touch()`


### Lowering 说明

- 通过目标平台感知的运行时辅助程序来 lowering `touch(path, mtime?, atime?)`。

## 运行时辅助程序

_未直接捕获到 `__rt_*` 辅助程序 —— lowering 是内联的，或者路由到另一个内置函数。_

## 签名摘要

```php
function touch(string $filename, int $mtime, int $atime): bool
```

## 类型检查器约束

- **参数个数 (Arity)**: 接受 1–3 个参数（2 个可选）。

## 交叉引用

- [touch() 用户参考文档](../../../php/builtins/filesystem/touch.md)
