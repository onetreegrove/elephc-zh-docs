---
title: "array_intersect()"
description: "针对两个兼容的索引数组（具有指针大小的有效负载槽）降低 `array_intersect()` 的实现。"
sidebar:
  order: 14
---

## array_intersect()

```php
function array_intersect(array $array, ...$arrays): array
```

针对两个兼容的索引数组（具有指针大小的有效负载槽）降低 `array_intersect()` 的实现。

**参数**：
- `$array` (`array`)
- `...$arrays` — 可变参数：将多余的参数收集到 `$arrays` 中。

**返回值**：`array`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解用法。_




## 内部实现

有关 `array_intersect` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_intersect.md)。

