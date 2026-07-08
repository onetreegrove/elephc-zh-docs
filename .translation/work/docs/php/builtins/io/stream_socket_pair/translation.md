---
title: "stream_socket_pair()"
description: "降级处理 `stream_socket_pair(domain, type, protocol)` 并封装 `array|false`。"
sidebar:
  order: 218
---

## stream_socket_pair()

```php
function stream_socket_pair(int $domain, int $type, int $protocol): mixed
```

降级处理 `stream_socket_pair(domain, type, protocol)` 并封装 `array|false`。

**参数**：
- `$domain` (`int`)
- `$type` (`int`)
- `$protocol` (`int`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_socket_pair` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_socket_pair.md)。
