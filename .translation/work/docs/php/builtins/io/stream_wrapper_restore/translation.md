---
title: "stream_wrapper_restore()"
description: "将 `stream_wrapper_restore(protocol)` 降级为成功的 no-op。"
sidebar:
  order: 225
---

## stream_wrapper_restore()

```php
function stream_wrapper_restore(string $protocol): bool
```

将 `stream_wrapper_restore(protocol)` 降级为成功的 no-op。

**参数**：
- `$protocol` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_wrapper_restore` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_wrapper_restore.md)。
