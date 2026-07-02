---
title: "array_shift()"
description: "通过压缩槽并把 `T|null` 装箱为 Mixed，为索引数组下放 `array_shift()`。"
sidebar:
  order: 36
---

## array_shift()

```php
function array_shift(array $array): mixed
```

通过压缩槽并把 `T|null` 装箱为 Mixed，为索引数组下放 `array_shift()`。

**参数**:
- `$array` (`array`)，引用传递

**返回值**: `mixed`

_暂无示例 — 请查阅 `examples/` 和 `showcases/` 了解使用模式。_







## 内部实现

关于 `array_shift` 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/array/array_shift.md)。
