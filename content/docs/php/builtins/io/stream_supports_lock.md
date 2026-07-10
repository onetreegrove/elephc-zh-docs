---
title: "stream_supports_lock()"
description: "资源拆箱后，将 `stream_supports_lock(stream)` 降级为 true。"
sidebar:
  order: 223
---

## stream_supports_lock()

```php
function stream_supports_lock(resource $stream): bool
```

资源拆箱后，将 `stream_supports_lock(stream)` 降级为 true。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_supports_lock` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_supports_lock.md)。
