---
title: "stream_set_timeout()"
description: "底层实现 `stream_set_timeout(stream, seconds, microseconds?)`。"
sidebar:
  order: 212
---

## stream_set_timeout()

```php
function stream_set_timeout(resource $stream, int $seconds, int $microseconds): bool
```

底层实现 `stream_set_timeout(stream, seconds, microseconds?)`。

**参数**：
- `$stream` (`resource`)
- `$seconds` (`int`)
- `$microseconds` (`int`)，可选

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录以了解用法。_




## 内部实现

有关 `stream_set_timeout` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_set_timeout.md)。

