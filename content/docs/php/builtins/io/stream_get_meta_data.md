---
title: "stream_get_meta_data()"
description: "通过元数据运行时辅助函数降级处理 `stream_get_meta_data(stream)`。"
sidebar:
  order: 202
---

## stream_get_meta_data()

```php
function stream_get_meta_data(resource $stream): array
```

通过元数据运行时辅助函数降级处理 `stream_get_meta_data(stream)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`array`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_







## 内部实现

有关 `stream_get_meta_data` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_get_meta_data.md)。
