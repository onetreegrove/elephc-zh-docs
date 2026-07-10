---
title: "putenv() — 内部实现"
description: "putenv() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 134
---

## `putenv()` — 内部实现

## 代码位置

- **签名**：[`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**：[`src/codegen_ir/lower_inst/builtins/system.rs`:657](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L657) (`lower_putenv`)
- **函数符号**：`lower_putenv()`


### Lowering 说明

- 通过将环境字符串复制到持久堆存储中，实现 `putenv(assignment)` 的 lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_php_uname`

## 签名摘要

```php
function putenv(string $assignment): bool
```

## 类型检查器强制的规则

- **参数个数**：恰好接受 1 个参数。

## 交叉引用

- [`putenv()` 的用户参考](../../../php/builtins/filesystem/putenv.md)
