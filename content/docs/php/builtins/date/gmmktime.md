---
title: "gmmktime()"
description: "降级实现 `gmmktime(...)`：它是 `mktime()` 的 UTC 对应函数。"
sidebar:
  order: 89
---

## gmmktime()

```php
function gmmktime(int $hour, int $minute, int $second, int $month, int $day, int $year): int
```

降级实现 `gmmktime(...)`：它是 `mktime()` 的 UTC 对应函数。

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

关于 `gmmktime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/gmmktime.md)。
