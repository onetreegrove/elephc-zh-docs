---
title: "stream_socket_sendto()"
description: "降级处理 `stream_socket_sendto(socket, data, flags?, address?)` 并封装 `int|false`。"
sidebar:
  order: 220
---

## stream_socket_sendto()

```php
function stream_socket_sendto(resource $socket, string $data, int $flags, string $address): mixed
```

降级处理 `stream_socket_sendto(socket, data, flags?, address?)` 并封装 `int|false`。

**参数**：
- `$socket` (`resource`)
- `$data` (`string`)
- `$flags` (`int`)，可选
- `$address` (`string`)，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_socket_sendto` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_sendto.md)。
