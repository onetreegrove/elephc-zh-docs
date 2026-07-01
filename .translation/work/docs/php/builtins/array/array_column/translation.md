---
title: "array_column()"
description: "通过分发到匹配行值所有权的辅助函数来降级处理 `array_column()`。"
sidebar:
  order: 4
---

## array_column()

```php
function array_column(array $array, string $column_key, string $index_key): array
```

通过分发到匹配行值所有权的辅助函数来降级处理 `array_column()`。

**参数**：
- `$array` (`array`)
- `$column_key` (`string`)
- `$index_key` (`string`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_

## 内部实现

关于 `array_column` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_column.md)。
