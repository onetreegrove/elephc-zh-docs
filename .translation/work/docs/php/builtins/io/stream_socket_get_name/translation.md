---
title: "stream_socket_get_name()"
description: "将 `stream_socket_get_name(socket, remote)` 降级处理并封装返回值为 `string|false`。"
sidebar:
  order: 217
---

## stream_socket_get_name()

```php
function stream_socket_get_name(resource $socket, bool $remote): mixed
```

将 `stream_socket_get_name(socket, remote)` 降级处理并封装返回值为 `string|false`。

**参数**：
- `$socket` (`resource`)
- `$remote` (`bool`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_

## 内部实现

关于 `stream_socket_get_name` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_get_name.md)。
