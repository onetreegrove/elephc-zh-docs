---
title: "date_default_timezone_set()"
description: "通过共享的运行时辅助函数降低 `date_default_timezone_set(timezoneId)`。"
sidebar:
  order: 86
---

## date_default_timezone_set()

```php
function date_default_timezone_set(string $timezoneId): bool
```

通过共享的运行时辅助函数降低 `date_default_timezone_set(timezoneId)`。

**参数**：
- `$timezoneId` (`string`)

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 获取使用模式。_







## 内部机制

关于 `date_default_timezone_set` 在编译器中的实现方式，请参阅[内部机制页面](../../../internals/builtins/date/date_default_timezone_set.md)。
