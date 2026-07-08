---
title: "stream_filter_remove()"
description: "降级处理 `stream_filter_remove(filter)`，并清除该 fd 的两个方向表。"
sidebar:
  order: 198
---

## stream_filter_remove()

```php
function stream_filter_remove(resource $stream_filter): bool
```

降级处理 `stream_filter_remove(filter)`，并清除该 fd 的两个方向表。

**参数**：
- `$stream_filter` (`resource`)

**返回值**：`bool`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_







## 内部实现

有关 `stream_filter_remove` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_filter_remove.md)。
