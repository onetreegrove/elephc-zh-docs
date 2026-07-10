---
title: "iterator_apply()"
description: "在受支持的 Traversable 源和回调形式上降级处理 `iterator_apply()`。"
sidebar:
  order: 316
---

## iterator_apply()

```php
function iterator_apply(traversable $iterator, callable $callback, array $args): int
```

在受支持的 Traversable 源和回调形式上降级处理 `iterator_apply()`。

**参数**：
- `$iterator` (`traversable`)
- `$callback` (`callable`)
- `$args` (`array`)，可选

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `iterator_apply` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/spl/iterator_apply.md)。
