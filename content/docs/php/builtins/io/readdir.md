---
title: "readdir()"
description: "为 libc、glob 及用户空间包装句柄降低 `readdir(dir_handle)` 的实现。"
sidebar:
  order: 184
---

## readdir()

```php
function readdir(resource $dir_handle): mixed
```

为 libc、glob 及用户空间包装句柄降低 `readdir(dir_handle)` 的实现。

**参数**：
- `$dir_handle` (`resource`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 中的使用模式。_




## 内部实现

关于 `readdir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/readdir.md)。

