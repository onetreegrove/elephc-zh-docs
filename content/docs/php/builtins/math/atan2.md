---
title: "atan2()"
description: "使用 C ABI 参数顺序 `y, x` 降级 `atan2()`。"
sidebar:
  order: 237
---

## atan2()

```php
function atan2(float $y, float $x): float
```

使用 C ABI 参数顺序 `y, x` 降级 `atan2()`。

**参数**:
- `$y` (`float`)
- `$x` (`float`)

**返回值**: `float`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_






## 内部实现

关于 `atan2` 在编译器中的具体实现，请参阅 [内部实现页面](../../../internals/builtins/math/atan2.md)。


