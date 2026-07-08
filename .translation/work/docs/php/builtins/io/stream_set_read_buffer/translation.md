---
title: "stream_set_read_buffer()"
description: "将流读/写缓冲区设置器降级为成功的空操作。"
sidebar:
  order: 211
---

## stream_set_read_buffer()

```php
function stream_set_read_buffer(resource $stream, int $size): int
```

将流读/写缓冲区设置器降级为成功的空操作。

**参数**：
- `$stream` (`resource`)
- `$size` (`int`)

**返回值**：`int`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录获取使用模式。_

## 内部实现

有关 `stream_set_read_buffer` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_set_read_buffer.md)。
