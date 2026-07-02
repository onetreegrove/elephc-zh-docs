---
title: "array_unshift()"
description: "通过确保唯一性、在开头添加一个标量值并返回计数来降级 `array_unshift()`。"
sidebar:
  order: 43
---

## array_unshift()

```php
function array_unshift(array $array, ...$values): int
```

通过确保唯一性、在开头添加一个标量值并返回计数来降级 `array_unshift()`。

**参数**:
- `$array` (`array`)，引用传递
- `...$values` — 可变参数：将多余的参数收集到 `$values` 中。

**返回值**: `int`

_暂无示例 — 请查阅 `examples/` 和 `showcases/` 了解使用模式。_







## 内部实现

关于 `array_unshift` 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/array/array_unshift.md)。
