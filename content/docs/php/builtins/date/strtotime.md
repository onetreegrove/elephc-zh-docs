---
title: "strtotime()"
description: "通过共享解析器运行时辅助函数降级实现 `strtotime(datetime[, baseTimestamp])`。"
sidebar:
  order: 94
---

## strtotime()

```php
function strtotime(string $datetime, int $baseTimestamp): mixed
```

通过共享解析器运行时辅助函数降级实现 `strtotime(datetime[, baseTimestamp])`。

**参数**：
- `$datetime` (`string`)
- `$baseTimestamp` (`int`)，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `strtotime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/strtotime.md)。
