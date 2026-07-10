---
title: "function_exists() — internals"
description: "function_exists() 的编译器内部实现：lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 73
---

## `function_exists()` — 内部实现

## 定义与实现位置

- **函数签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins.rs`:801](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins.rs#L801) (`lower_function_exists`)
- **函数符号**: `lower_function_exists()`


### Lowering 说明

- 针对编译时已确定的字符串名称，对 `function_exists("name")` 进行降级（lowering）。
- 识别用户函数、extern、目录内置函数，以及 `name_resolver` 展开的日期/时间过程式别名（包括注入的时区自省前导函数）。这些别名是通过 `is_date_procedural_alias` 进行匹配，而不是通过目录，因为它们的调用点在代码生成（codegen）之前就被重写了，所以它们永远不会到达内置函数目录，但为了与 PHP 的行为保持一致，仍然必须报告为存在。

## 运行时辅助函数

_未捕获到直接的 `__rt_*` 辅助函数 —— lowering 是内联的，或者路由到了另一个内置函数（builtin）。_

## 签名摘要

```php
function function_exists(string $function): bool
```

## 类型检查器强制约束

- **参数个数（Arity）**: 恰好接受 1 个参数。

## 交叉引用

- [`function_exists()` 的用户参考指南](../../../php/builtins/class/function_exists.md)
