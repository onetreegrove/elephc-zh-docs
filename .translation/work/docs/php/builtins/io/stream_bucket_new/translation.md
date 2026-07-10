---
title: "stream_bucket_new()"
description: "将 `stream_bucket_new(stream, data)` 降级为一个以 stdClass 为底层的 bucket 对象。"
sidebar:
  order: 188
---

## stream_bucket_new()

```php
function stream_bucket_new(resource $stream, string $buffer): mixed
```

将 `stream_bucket_new(stream, data)` 降级为一个以 stdClass 为底层的 bucket 对象。

**参数**：
- `$stream` (`resource`)
- `$buffer` (`string`)

**返回值**：`mixed`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解使用方式。_

## 内部实现

关于 `stream_bucket_new` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_bucket_new.md)。
