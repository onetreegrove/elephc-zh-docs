---
title: "is_object()"
description: "降级处理 `is_object()`：对静态已知对象，或装箱的 Mixed/Union 值返回 true。"
sidebar:
  order: 423
---

## is_object()

```php
function is_object(mixed $value): bool
```

降级处理 `is_object()`：对静态已知对象，或装箱的 Mixed/Union 值返回 true。

**参数**：
- `$value` (`mixed`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `is_object` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/is_object.md)。
