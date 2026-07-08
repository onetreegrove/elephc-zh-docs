---
title: "stream_context_set_params()"
description: "将 `stream_context_set_params(context, params)` 作为可接受的参数更新进行降级处理。"
sidebar:
  order: 195
---

## stream_context_set_params()

```php
function stream_context_set_params(resource $context, array $params): bool
```

将 `stream_context_set_params(context, params)` 作为可接受的参数更新进行降级处理。

**参数**：
- `$context` (`resource`)
- `$params` (`array`)

**返回值**：`bool`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_





## 内部实现

有关 `stream_context_set_params` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_context_set_params.md)。
