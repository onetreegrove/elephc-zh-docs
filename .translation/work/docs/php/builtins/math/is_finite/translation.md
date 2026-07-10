---
title: "is_finite()"
description: "通过排除 NaN 和正负无穷大来下放 `is_finite()`。"
sidebar:
  order: 249
---

## is_finite()

```php
function is_finite(float $num): bool
```

通过排除 NaN 和正负无穷大来下放 `is_finite()`。

**参数**：
- `$num` (`float`)

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 了解使用模式。_






## 内部实现

关于 `is_finite` 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/math/is_finite.md)。
