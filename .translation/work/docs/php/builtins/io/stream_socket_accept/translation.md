---
title: "stream_socket_accept()"
description: "lowering `stream_socket_accept(server, timeout?, peer_name?)`。"
sidebar:
  order: 214
---

## stream_socket_accept()

```php
function stream_socket_accept(resource $socket, float $timeout, string $peer_name): mixed
```

lowering `stream_socket_accept(server, timeout?, peer_name?)`。

**参数**：
- `$socket` (`resource`)
- `$timeout` (`float`)，可选
- `$peer_name` (`string`)，按引用传递，可选

**返回值**：`mixed`

_暂无示例——请查阅 `examples/` 和 `showcases/` 了解用法。_

## 内部实现

关于 `stream_socket_accept` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_accept.md)。
