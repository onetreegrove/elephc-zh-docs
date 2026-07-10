---
title: "stream_get_contents()"
description: "将 `stream_get_contents(stream, length?, offset?)` 降级为 `string|false`。"
sidebar:
  order: 199
---

## stream_get_contents()

```php
function stream_get_contents(resource $stream, int $length, int $offset): mixed
```

将 `stream_get_contents(stream, length?, offset?)` 降级为 `string|false`。

**参数**：
- `$stream` (`resource`)
- `$length` (`int`)，可选
- `$offset` (`int`)，可选

**返回值**：`mixed`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_







## 内部实现

有关 `stream_get_contents` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_get_contents.md)。
