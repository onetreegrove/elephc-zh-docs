---
title: "array_udiff()"
description: "降级 `array_udiff()`：保留第一个数组中与第二个数组中的任何元素（按比较器）不相等的元素。"
sidebar:
  order: 40
---

## array_udiff()

```php
function array_udiff(array $array1, array $array2, callable $callback): mixed
```

降级 `array_udiff()`：保留第一个数组中与第二个数组中的任何元素（按比较器）不相等的元素。

**参数**：
- `$array1` (`array`)
- `$array2` (`array`)
- `$callback` (`callable`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_






## 内部实现

有关 `array_udiff` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_udiff.md)。
