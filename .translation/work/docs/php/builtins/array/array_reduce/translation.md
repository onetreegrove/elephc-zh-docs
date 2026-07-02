---
title: "array_reduce()"
description: "通过回调驱动的运行时辅助函数降级处理 `array_reduce()`。"
sidebar:
  order: 31
---

## array_reduce()

```php
function array_reduce(array $array, callable $callback, mixed $initial): int
```

通过回调驱动的运行时辅助函数降级处理 `array_reduce()`。

**参数**：
- `$array` (`array`)
- `$callback` (`callable`)
- `$initial` (`mixed`)，可选

**返回值**：`int`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 目录以了解使用模式。_

## 内部实现

关于 `array_reduce` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_reduce.md)。
