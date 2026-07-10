---
title: "hrtime()"
description: "通过单调时钟运行时辅助函数降级实现 `hrtime([$as_number])`。"
sidebar:
  order: 90
---

## hrtime()

```php
function hrtime(bool $as_number): mixed
```

通过单调时钟运行时辅助函数降级实现 `hrtime([$as_number])`。

**参数**：
- `$as_number` (`bool`)，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `hrtime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/hrtime.md)。
