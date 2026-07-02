---
title: "array_slice()"
description: "对具有指针大小负载槽的索引数组下放 `array_slice()`。"
sidebar:
  order: 37
---

## array_slice()

```php
function array_slice(array $array, int $offset, int $length, bool $preserve_keys): array
```

对具有指针大小负载槽的索引数组下放 `array_slice()`。

**参数**：
- `$array` (`array`)
- `$offset` (`int`)
- `$length` (`int`)，可选
- `$preserve_keys` (`bool`)

**返回值**：`array`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_






## 内部实现

有关 `array_slice` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_slice.md)。
