---
title: "iterator_to_array()"
description: "在数组、`iterable` 和 Traversable 对象上降级处理 `iterator_to_array()`。"
sidebar:
  order: 318
---

## iterator_to_array()

```php
function iterator_to_array(traversable $iterator, bool $preserve_keys): array
```

在数组、`iterable` 和 Traversable 对象上降级处理 `iterator_to_array()`。

**参数**：
- `$iterator` (`traversable`)
- `$preserve_keys` (`bool`)，可选

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `iterator_to_array` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/spl/iterator_to_array.md)。
