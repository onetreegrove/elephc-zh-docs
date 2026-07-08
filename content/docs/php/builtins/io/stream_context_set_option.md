---
title: "stream_context_set_option()"
description: "将 `stream_context_set_option(context, options)` 及四参数形式降级处理。"
sidebar:
  order: 194
---

## stream_context_set_option()

```php
function stream_context_set_option(resource $context, string $wrapper_or_options, string $option_name, mixed $value): bool
```

将 `stream_context_set_option(context, options)` 及四参数形式降级处理。

**参数**：
- `$context` (`resource`)
- `$wrapper_or_options` (`string`)
- `$option_name` (`string`)，可选
- `$value` (`mixed`)，可选

**返回值**：`bool`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_




## 内部实现

有关 `stream_context_set_option` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_context_set_option.md)。

