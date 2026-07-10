---
title: "stream_socket_enable_crypto()"
description: "降级处理 `stream_socket_enable_crypto(stream, enable, method?, session_stream?)`。"
sidebar:
  order: 216
---

## stream_socket_enable_crypto()

```php
function stream_socket_enable_crypto(resource $stream, bool $enable, int $crypto_method, resource $session_stream): bool
```

降级处理 `stream_socket_enable_crypto(stream, enable, method?, session_stream?)`。

**参数**：
- `$stream` (`resource`)
- `$enable` (`bool`)
- `$crypto_method` (`int`)，可选
- `$session_stream` (`resource`)，可选

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以获取使用模式。_




## 内部实现

有关 `stream_socket_enable_crypto` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_enable_crypto.md)。

