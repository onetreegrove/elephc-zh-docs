---
title: "is_iterable()"
description: "针对具体值和装箱的 Mixed 载荷降级处理 `is_iterable()`。"
sidebar:
  order: 420
---

## is_iterable()

```php
function is_iterable(mixed $value): bool
```

针对具体值和装箱的 Mixed 载荷降级处理 `is_iterable()`。

**参数**：
- `$value` (`mixed`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `is_iterable` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/is_iterable.md)。
