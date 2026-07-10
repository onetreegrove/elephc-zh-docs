---
title: "stream_copy_to_stream()"
description: "通过可感知 wrapper 的读/写循环降级处理 `stream_copy_to_stream(from, to, length?, offset?)`。"
sidebar:
  order: 196
---

## stream_copy_to_stream()

```php
function stream_copy_to_stream(resource $from, resource $to, int $length, int $offset): mixed
```

通过可感知 wrapper 的读/写循环降级处理 `stream_copy_to_stream(from, to, length?, offset?)`。

**参数**：
- `$from` (`resource`)
- `$to` (`resource`)
- `$length` (`int`)，可选
- `$offset` (`int`)，可选

**返回值**：`mixed`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_







## 内部实现

有关 `stream_copy_to_stream` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_copy_to_stream.md)。
