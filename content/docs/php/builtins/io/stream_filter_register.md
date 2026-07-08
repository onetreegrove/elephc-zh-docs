---
title: "stream_filter_register()"
description: "将 `stream_filter_register(filter_name, class)` 降级到用户过滤器注册表辅助函数。"
sidebar:
  order: 197
---

## stream_filter_register()

```php
function stream_filter_register(string $filter_name, string $class): bool
```

将 `stream_filter_register(filter_name, class)` 降级到用户过滤器注册表辅助函数。

**参数**：
- `$filter_name` (`string`)
- `$class` (`string`)

**返回值**：`bool`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的用法模式。_







## 内部实现

有关 `stream_filter_register` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_filter_register.md)。
