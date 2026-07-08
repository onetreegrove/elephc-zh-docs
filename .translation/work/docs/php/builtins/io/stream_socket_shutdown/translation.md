---
title: "stream_socket_shutdown()"
description: "降级处理 `stream_socket_shutdown(stream, mode)`。"
sidebar:
  order: 222
---

## stream_socket_shutdown()

```php
function stream_socket_shutdown(resource $stream, int $mode): bool
```

降级处理 `stream_socket_shutdown(stream, mode)`。

**参数**：
- `$stream` (`resource`)
- `$mode` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_socket_shutdown` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_shutdown.md)。
