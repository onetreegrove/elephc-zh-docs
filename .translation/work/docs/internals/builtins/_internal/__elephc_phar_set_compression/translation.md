---
title: "__elephc_phar_set_compression() — 内部实现"
description: "__elephc_phar_set_compression() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 440
---

## `__elephc_phar_set_compression()` — 内部实现

## 代码位置

- **函数签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/io.rs`:3801](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L3801) (`lower_elephc_phar_set_compression`)
- **函数符号**：`lower_elephc_phar_set_compression()`


### Lowering 说明

- 用于内置 Phar / PharData 支持以更改归档压缩格式的内部辅助函数。
- 调用原生 PHAR 压缩控制桥接，并返回更新是否成功。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— Lowering 过程已被内联，或通过其他内置函数进行路由。_

## 签名摘要

```php
function __elephc_phar_set_compression(mixed $filename, mixed $compression): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 2 个参数。

## 交叉引用

- _无面向用户的引用 —— 这是一个编译器内部辅助函数。_
