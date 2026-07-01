---
title: "array_intersect_key()"
description: "针对两个关联数组，保留第一个操作数中与其余数组键名相同的元素，实现 `array_intersect_key()` 的降级处理。"
sidebar:
  order: 16
---

## array_intersect_key()

```php
function array_intersect_key(array $array, ...$arrays): array
```

针对两个关联数组，保留第一个操作数中与其余数组键名相同的元素，实现 `array_intersect_key()` 的降级处理。

**参数**：
- `$array` (`array`)
- `...$arrays` — 可变参数：将多余的参数收集到 `$arrays` 中。

**返回值**：`array`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_

## 内部实现

有关 `array_intersect_key` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_intersect_key.md)。
