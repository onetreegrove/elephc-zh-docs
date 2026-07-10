---
title: "number_format()"
description: "通过排列其运行时辅助函数参数降级处理 `number_format()`。"
sidebar:
  order: 368
---

## number_format()

```php
function number_format(float $num, int $decimals, string $decimal_separator, string $thousands_separator): string
```

通过排列其运行时辅助函数参数降级处理 `number_format()`。

**参数**：
- `$num` (`float`)
- `$decimals` (`int`)，可选
- `$decimal_separator` (`string`)，可选
- `$thousands_separator` (`string`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `number_format` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/number_format.md)。
