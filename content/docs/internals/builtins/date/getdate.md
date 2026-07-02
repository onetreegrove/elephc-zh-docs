---
title: "getdate() — 内部实现"
description: "getdate() 的编译器内部实现：Lowering 路径、类型检查和运行时辅助函数。"
sidebar:
  order: 87
---

## `getdate()` — 内部实现

## 实现位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/system.rs`:183](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/system.rs#L183) (`lower_getdate`)
- **函数符号**: `lower_getdate()`


### Lowering 说明

- 通过共享的分解运行时辅助函数对 `getdate([$timestamp])` 执行 lowering。
- 将可选的时间戳（在省略时作为当前时间的 `-1` 哨兵值；装箱的
- `Mixed`/`Union` 参数会被拆箱）整理到整数结果寄存器中，在此处由 `__rt_getdate`
- 读取，然后将返回的关联数组哈希指针装箱到 `Mixed` cell 中 —— 这与
- `stat`/`getdate` 使用的表示形式相同，因此检查器将结果类型确定为 `Mixed`。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_getdate`
- `__rt_mixed_from_value`

## 签名摘要

```php
function getdate(int $timestamp): array
```

## 类型检查器约束

- **参数个数**: 接受 0–1 个参数（1 个可选）。

## 交叉引用

- [`getdate()` 的用户参考](../../../php/builtins/date/getdate.md)
