---
title: "stream_wrapper_register()"
description: "降级处理 `stream_wrapper_register(protocol, class, flags?)`。"
sidebar:
  order: 224
---

## stream_wrapper_register()

```php
function stream_wrapper_register(string $protocol, string $class, int $flags): bool
```

降级处理 `stream_wrapper_register(protocol, class, flags?)`。

**参数**：
- `$protocol` (`string`)
- `$class` (`string`)
- `$flags` (`int`)，可选

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stream_wrapper_register` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_wrapper_register.md)。
