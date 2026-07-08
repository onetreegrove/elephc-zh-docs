---
title: "stream_get_line()"
description: "降级处理 `stream_get_line(stream, length, ending?)`。"
sidebar:
  order: 201
---

## stream_get_line()

```php
function stream_get_line(resource $stream, int $length, string $ending): string
```

降级处理 `stream_get_line(stream, length, ending?)`。

**参数**：
- `$stream` (`resource`)
- `$length` (`int`)
- `$ending` (`string`)，可选

**返回值**：`string`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_







## 内部实现

有关 `stream_get_line` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_get_line.md)。
