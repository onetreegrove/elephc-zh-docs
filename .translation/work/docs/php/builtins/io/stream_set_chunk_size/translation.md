---
title: "stream_set_chunk_size()"
description: "调用 `stream_set_chunk_size(stream, size)` 并返回之前的大小。"
sidebar:
  order: 210
---

## stream_set_chunk_size()

```php
function stream_set_chunk_size(resource $stream, int $size): int
```

调用 `stream_set_chunk_size(stream, size)` 并返回之前的大小。

**参数**：
- `$stream` (`resource`)
- `$size` (`int`)

**返回值**：`int`

_暂无示例——可参阅 `examples/` 和 `showcases/` 目录了解用法。_



## 内部实现

关于 `stream_set_chunk_size` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_set_chunk_size.md)。

