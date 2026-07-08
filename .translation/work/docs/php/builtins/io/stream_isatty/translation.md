---
title: "stream_isatty()"
description: "降级处理 `stream_isatty(stream)`。"
sidebar:
  order: 206
---

## stream_isatty()

```php
function stream_isatty(resource $stream): bool
```

降级处理 `stream_isatty(stream)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

关于 `stream_isatty` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_isatty.md)。

