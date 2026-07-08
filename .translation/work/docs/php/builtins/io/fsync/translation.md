---
title: "fsync()"
description: "通过共享的 fd 同步运行时助手来实现 `fsync(stream)` 的降级处理。"
sidebar:
  order: 171
---

## fsync()

```php
function fsync(resource $stream): bool
```

通过共享的 fd 同步运行时助手来实现 `fsync(stream)` 的降级处理。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录了解使用模式。_




## 内部实现

关于 `fsync` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fsync.md)。

