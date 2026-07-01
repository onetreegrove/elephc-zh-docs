---
title: "array_splice()"
description: "通过修改源索引数组并返回被移除的元素来降级 `array_splice()`。"
sidebar:
  order: 38
---

## array_splice()

```php
function array_splice(array $array, int $offset, int $length, array $replacement): array
```

通过修改源索引数组并返回被移除的元素来降级 `array_splice()`。

**参数**：
- `$array` (`array`)，引用传递
- `$offset` (`int`)
- `$length` (`int`)，可选
- `$replacement` (`array`)

**返回值**：`array`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_







## 内部实现

有关 `array_splice` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_splice.md)。
