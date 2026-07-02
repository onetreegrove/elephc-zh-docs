---
title: "array_keys()"
description: "为索引数组和关联数组降级实现 `array_keys()`。"
sidebar:
  order: 21
---

## array_keys()

```php
function array_keys(array $array, string $filter_value, bool $strict): array
```

为索引数组和关联数组降级实现 `array_keys()`。

**参数**：
- `$array` (`array`)
- `$filter_value` (`string`)
- `$strict` (`bool`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `array_keys` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_keys.md)。
