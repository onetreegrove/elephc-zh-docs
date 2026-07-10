---
title: "stream_is_local()"
description: "在对参数求值后，将 `stream_is_local(stream)` 作为恒真谓词进行降级处理。"
sidebar:
  order: 205
---

## stream_is_local()

```php
function stream_is_local(resource $stream): bool
```

在对参数求值后，将 `stream_is_local(stream)` 作为恒真谓词进行降级处理。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录以了解用法。_




## 内部实现

有关 `stream_is_local` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_is_local.md)。

