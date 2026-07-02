---
title: "array_walk_recursive()"
description: "降级 `array_walk_recursive()`：对（可能嵌套的）每个标量叶子节点调用回调函数。"
sidebar:
  order: 46
---

## array_walk_recursive()

```php
function array_walk_recursive(array $array, callable $callback, mixed $value): void
```

降级 `array_walk_recursive()`：对（可能嵌套的）每个标量叶子节点调用回调函数。

**参数**:
- `$array` (`array`)，引用传递
- `$callback` (`callable`)
- `$value` (`mixed`)

**返回值**: `void`

_暂无示例 — 请查阅 `examples/` 和 `showcases/` 了解使用模式。_







## 内部实现

关于 `array_walk_recursive` 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/array/array_walk_recursive.md)。
