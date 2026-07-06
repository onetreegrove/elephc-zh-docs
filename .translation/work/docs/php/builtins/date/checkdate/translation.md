---
title: "checkdate()"
description: "通过共享的公历校验运行时辅助函数降低 `checkdate(month, day, year)`。"
sidebar:
  order: 83
---

## checkdate()

```php
function checkdate(int $month, int $day, int $year): bool
```

通过共享的公历校验运行时辅助函数降低 `checkdate(month, day, year)`。

**参数**：
- `$month` (`int`)
- `$day` (`int`)
- `$year` (`int`)

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 获取使用模式。_







## 内部机制

关于 `checkdate` 在编译器中的实现方式，请参阅[内部机制页面](../../../internals/builtins/date/checkdate.md)。
