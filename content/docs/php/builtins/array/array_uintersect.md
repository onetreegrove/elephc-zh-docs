---
title: "array_uintersect()"
description: "降级 `array_uintersect()`：保留第一个数组中（根据比较器）与第二个数组中某些元素相等的元素。"
sidebar:
  order: 41
---

## array_uintersect()

```php
function array_uintersect(array $array1, array $array2, callable $callback): mixed
```

降级 `array_uintersect()`：保留第一个数组中（根据比较器）与第二个数组中某些元素相等的元素。

**参数**：
- `$array1` (`array`)
- `$array2` (`array`)
- `$callback` (`callable`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_

## 内部实现

有关 `array_uintersect` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_uintersect.md)。
