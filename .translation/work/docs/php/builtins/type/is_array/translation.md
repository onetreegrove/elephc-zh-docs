---
title: "is_array()"
description: "降级处理 `is_array()`：对静态已知的 array/hash，或装箱的 Mixed/Union 值返回 true。"
sidebar:
  order: 415
---

## is_array()

```php
function is_array(mixed $value): bool
```

降级处理 `is_array()`：对静态已知的 array/hash，或装箱的 Mixed/Union 值返回 true。

**参数**：
- `$value` (`mixed`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `is_array` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/is_array.md)。
