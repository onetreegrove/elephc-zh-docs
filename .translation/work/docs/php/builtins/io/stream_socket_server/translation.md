---
title: "stream_socket_server()"
description: "降级处理 `stream_socket_server(address)` 并封装 `resource|false`。"
sidebar:
  order: 221
---

## stream_socket_server()

```php
function stream_socket_server(string $address, int $error_code, int $error_message): mixed
```

降级处理 `stream_socket_server(address)` 并封装 `resource|false`。

**参数**：
- `$address` (`string`)
- `$error_code` (`int`)，按引用传递
- `$error_message` (`int`)，按引用传递

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_socket_server` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_server.md)。
