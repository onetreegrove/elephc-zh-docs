---
title: "fwrite() —— 内部实现"
description: "fwrite() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 174
---

## `fwrite()` —— 内部实现

## 所在位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:2838](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L2838) (`lower_fwrite`)
- **函数符号**: `lower_fwrite()`


### Lowering 说明

- 对 `fwrite(stream, data)` 进行 lowering，并返回写入的字节数。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_fwrite`

## 签名摘要

```php
function fwrite(resource $stream, string $data, int $length): int
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 3 个参数。

## 交叉引用

- [`fwrite()` 用户参考](../../../php/builtins/io/fwrite.md)
