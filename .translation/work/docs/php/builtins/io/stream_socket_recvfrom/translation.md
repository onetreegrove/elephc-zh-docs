---
title: "stream_socket_recvfrom()"
description: "降级处理 `stream_socket_recvfrom(socket, length, flags?, address?)`。"
sidebar:
  order: 219
---

## stream_socket_recvfrom()

```php
function stream_socket_recvfrom(resource $socket, int $length, int $flags, string $address): mixed
```

降级处理 `stream_socket_recvfrom(socket, length, flags?, address?)`。

**参数**：
- `$socket` (`resource`)
- `$length` (`int`)
- `$flags` (`int`)，可选
- `$address` (`string`)，按引用传递，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_socket_recvfrom` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_recvfrom.md)。
