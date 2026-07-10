---
title: "is_scalar()"
description: "降级处理 `is_scalar()`：对 int/float/string/bool、非 null 的 tagged scalar，或装箱标量返回 true。"
sidebar:
  order: 425
---

## is_scalar()

```php
function is_scalar(mixed $value): bool
```

降级处理 `is_scalar()`：对 int/float/string/bool、非 null 的 tagged scalar，或装箱标量返回 true。

**参数**：
- `$value` (`mixed`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `is_scalar` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/is_scalar.md)。
