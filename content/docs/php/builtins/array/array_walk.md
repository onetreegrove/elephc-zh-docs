---
title: "array_walk()"
description: "通过回调驱动的运行时辅助函数降级处理 `array_walk()`。"
sidebar:
  order: 45
---

## array_walk()

```php
function array_walk(array $array, callable $callback, mixed $arg): void
```

通过回调驱动的运行时辅助函数降级处理 `array_walk()`。

**参数**：
- `$array` (`array`)，通过引用传递
- `$callback` (`callable`)
- `$arg` (`mixed`)

**返回值**：`void`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `array_walk` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_walk.md)。
