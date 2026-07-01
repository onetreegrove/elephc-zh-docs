---
title: "array_filter()"
description: "通过运行时辅助函数，为静态回调和一等回调降级处理 `array_filter()`。"
sidebar:
  order: 11
---

## array_filter()

```php
function array_filter(array $array, callable $callback, int $mode): array
```

通过运行时辅助函数，为静态回调和一等回调降级处理 `array_filter()`。

**参数**：
- `$array` (`array`)
- `$callback` (`callable`)，可选
- `$mode` (`int`)，可选

**返回值**：`array`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录了解用法示例。_




## 内部实现

有关 `array_filter` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_filter.md)。

