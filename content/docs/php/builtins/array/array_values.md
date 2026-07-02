---
title: "array_values()"
description: "对于索引数组，将 `array_values()` 降级为别名；对于关联数组，则降级为新的值数组。"
sidebar:
  order: 44
---

## array_values()

```php
function array_values(array $array): array
```

对于索引数组，将 `array_values()` 降级为别名；对于关联数组，则降级为新的值数组。

**参数**：
- `$array` (`array`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_

## 内部实现

关于 `array_values` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_values.md)。
