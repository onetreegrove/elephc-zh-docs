---
title: "stream_set_blocking()"
description: "降级实现 `stream_set_blocking(stream, enable)`。"
sidebar:
  order: 209
---

## stream_set_blocking()

```php
function stream_set_blocking(resource $stream, bool $enable): bool
```

降级实现 `stream_set_blocking(stream, enable)`。

**参数**：
- `$stream` (`resource`)
- `$enable` (`bool`)

**返回值**：`bool`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解用法。_




## 内部实现

关于 `stream_set_blocking` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_set_blocking.md)。

