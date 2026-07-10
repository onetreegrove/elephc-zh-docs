---
title: "mktime()"
description: "通过运行时辅助函数降级实现 `mktime(hour, minute, second, month, day, year)`。"
sidebar:
  order: 93
---

## mktime()

```php
function mktime(int $hour, int $minute, int $second, int $month, int $day, int $year): int
```

通过运行时辅助函数降级实现 `mktime(hour, minute, second, month, day, year)`。

**参数**：
- `$hour` (`int`)
- `$minute` (`int`)
- `$second` (`int`)
- `$month` (`int`)
- `$day` (`int`)
- `$year` (`int`)

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `mktime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/mktime.md)。
