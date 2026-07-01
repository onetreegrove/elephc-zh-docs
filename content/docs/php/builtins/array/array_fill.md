---
title: "array_fill()"
description: "为指针大小的标量及引用计数载荷降级实现 `array_fill()`。"
sidebar:
  order: 9
---

## array_fill()

```php
function array_fill(int $start_index, int $count, mixed $value): array
```

为指针大小的标量及引用计数载荷降级实现 `array_fill()`。

**参数**：
- `$start_index` (`int`)
- `$count` (`int`)
- `$value` (`mixed`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

关于 `array_fill` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_fill.md)。

