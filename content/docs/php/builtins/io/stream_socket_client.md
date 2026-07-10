---
title: "stream_socket_client()"
description: "将 `stream_socket_client(address)` 降级处理，并记录已连接的主机以用于 TLS 默认配置。"
sidebar:
  order: 215
---

## stream_socket_client()

```php
function stream_socket_client(string $address, int $error_code, int $error_message, string $timeout, float $flags): mixed
```

将 `stream_socket_client(address)` 降级处理，并记录已连接的主机以用于 TLS 默认配置。

**参数**：
- `$address` (`string`)
- `$error_code` (`int`)，按引用传递
- `$error_message` (`int`)，按引用传递
- `$timeout` (`string`)
- `$flags` (`float`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

关于 `stream_socket_client` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_client.md)。

