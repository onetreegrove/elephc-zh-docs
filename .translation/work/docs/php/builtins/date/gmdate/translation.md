---
title: "gmdate()"
description: "降级实现 `gmdate(format[, timestamp])`：它是 `date()` 的 UTC 对应函数。"
sidebar:
  order: 88
---

## gmdate()

```php
function gmdate(string $format, int $timestamp): string
```

降级实现 `gmdate(format[, timestamp])`：它是 `date()` 的 UTC 对应函数。

**参数**：
- `$format` (`string`)
- `$timestamp` (`int`)，可选

**返回值**：`string`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `gmdate` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/gmdate.md)。
