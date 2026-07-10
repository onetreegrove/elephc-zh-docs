---
title: "stream_select()"
description: "降级实现 `stream_select(read, write, except, seconds, microseconds?)`。"
sidebar:
  order: 208
---

## stream_select()

```php
function stream_select(array $read, array $write, array $except, int $seconds, int $microseconds): int
```

降级实现 `stream_select(read, write, except, seconds, microseconds?)`。

**参数**：
- `$read`（`array`），按引用传递
- `$write`（`array`），按引用传递
- `$except`（`array`），按引用传递
- `$seconds`（`int`）
- `$microseconds`（`int`），可选

**返回值**：`int`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解使用方式。_




## 内部实现

有关 `stream_select` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_select.md)。
