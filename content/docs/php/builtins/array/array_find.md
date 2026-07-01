---
title: "array_find()"
description: "降级编译 `array_find()`：返回满足谓词的第一个元素，以 Mixed 形式装箱（或返回 null）。"
sidebar:
  order: 12
---

## array_find()

```php
function array_find(array $array, mixed $callback): mixed
```

降级编译 `array_find()`：返回满足谓词的第一个元素，以 Mixed 形式装箱（或返回 null）。

**参数**：
- `$array` (`array`)
- `$callback` (`mixed`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的用法示例。_




## 内部实现

有关 `array_find` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_find.md)。

