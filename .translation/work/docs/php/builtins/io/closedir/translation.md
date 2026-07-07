---
title: "closedir()"
description: "针对 libc、glob 和用户空间包装器句柄降级实现 `closedir(dir_handle)`。"
sidebar:
  order: 151
---

## closedir()

```php
function closedir(resource $dir_handle): void
```

针对 libc、glob 和用户空间包装器句柄降级实现 `closedir(dir_handle)`。

**参数**：
- `$dir_handle` (`resource`)

**返回值**：`void`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `closedir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/closedir.md)。
