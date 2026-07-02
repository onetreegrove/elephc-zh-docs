---
title: "array_push()"
description: "通过追加一个值并发布变动后的数组来降级 `array_push()`。"
sidebar:
  order: 29
---

## array_push()

```php
function array_push(array $array, ...$values): void
```

通过追加一个值并发布变动后的数组来降级 `array_push()`。

**参数**:
- `$array` (`array`)，通过引用传递
- `...$values` — 可变参数：将多余的参数收集到 `$values` 中。

**返回**: `void`

_暂无示例 —— 请查看 `examples/` 和 `showcases/` 了解使用模式。_






## 内部实现

关于 `array_push` 在编译器中是如何实现的，请参见[内部实现页面](../../../internals/builtins/array/array_push.md)。
