---
title: "range()"
description: "通过共享的运行时构造函数，为整数端点的 `range()` 降级实现。"
sidebar:
  order: 55
---

## range()

```php
function range(mixed $start, mixed $end, int $step): array
```

通过共享的运行时构造函数，为整数端点的 `range()` 降级实现。

**参数**:
- `$start` (`mixed`)
- `$end` (`mixed`)
- `$step` (`int`)

**返回值**: `array`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 获取使用模式。_







## 内部实现

关于 `range` 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/array/range.md)。
