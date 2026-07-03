---
title: "chgrp() —— 内部实现"
description: "chgrp() 的编译器内部实现：Lowering 路径、类型检查以及运行时辅助函数。"
sidebar:
  order: 98
---

## `chgrp()` —— 内部实现

## 源码位置

- **签名**: [`src/types/signatures.rs`](https://github.com/illegalstudio/elephc/blob/main/src/types/signatures.rs)
- **Lowering**: [`src/codegen_ir/lower_inst/builtins/io.rs`:4478](https://github.com/illegalstudio/elephc/blob/main/src/codegen_ir/lower_inst/builtins/io.rs#L4478) (`lower_chgrp`)
- **函数符号**: `lower_chgrp()`


### Lowering 说明

- 将针对整数 GID 和字符串组名的 `chgrp(path, group)` 进行 Lowering。

## 运行时辅助函数

引用了以下运行时辅助函数：
- `__rt_umask`

## 签名摘要

```php
function chgrp(string $filename, int $group): bool
```

## 类型检查器约束

- **参数个数 (Arity)**：恰好接受 2 个参数。

## 交叉引用

- [`chgrp()` 的用户参考](../../../php/builtins/filesystem/chgrp.md)
