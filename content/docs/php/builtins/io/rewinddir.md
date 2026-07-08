---
title: "rewinddir()"
description: "为 libc、glob 及用户空间包装句柄降级处理 `rewinddir(dir_handle)`。"
sidebar:
  order: 186
---

## rewinddir()

```php
function rewinddir(resource $dir_handle): void
```

为 libc、glob 及用户空间包装句柄降级处理 `rewinddir(dir_handle)`。

**参数**：
- `$dir_handle` (`resource`)

**返回值**：`void`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的用法示例。_




## 内部实现

关于 `rewinddir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/rewinddir.md)。

