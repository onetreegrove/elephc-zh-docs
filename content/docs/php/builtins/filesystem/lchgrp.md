---
title: "lchgrp()"
description: "针对整数 GID 和字符串组名降级实现 `lchgrp(path, group)`，且不跟随符号链接。"
sidebar:
  order: 127
---

## lchgrp()

```php
function lchgrp(string $filename, int $group): bool
```

针对整数 GID 和字符串组名降级实现 `lchgrp(path, group)`，且不跟随符号链接。

**参数**：
- `$filename` (`string`)
- `$group` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `lchgrp` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/lchgrp.md)。
