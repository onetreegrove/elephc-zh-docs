---
title: "stream_set_write_buffer()"
description: "将流读写缓冲区设置器作为成功的空操作处理。"
sidebar:
  order: 213
---

## stream_set_write_buffer()

```php
function stream_set_write_buffer(resource $stream, int $size): int
```

将流读写缓冲区设置器作为成功的空操作处理。

**参数**：
- `$stream` (`resource`)
- `$size` (`int`)

**返回值**：`int`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_




## 内部实现

关于 `stream_set_write_buffer` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_set_write_buffer.md)。
