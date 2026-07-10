---
title: "date()"
description: "通过共享格式化器运行时辅助函数降级实现 `date(format, timestamp?)`。"
sidebar:
  order: 84
---

## date()

```php
function date(string $format, int $timestamp): string
```

通过共享格式化器运行时辅助函数降级实现 `date(format, timestamp?)`。

**参数**：
- `$format` (`string`)
- `$timestamp` (`int`)，可选

**返回值**：`string`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `date` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/date.md)。
