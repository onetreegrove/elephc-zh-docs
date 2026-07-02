---
title: "array_unique()"
description: "针对具有 8 字节有效负载槽的索引数组降级 `array_unique()`。"
sidebar:
  order: 42
---

## array_unique()

```php
function array_unique(array $array, int $flags): array
```

针对具有 8 字节有效负载槽的索引数组降级 `array_unique()`。

**参数**：
- `$array` (`array`)
- `$flags` (`int`)

**返回**：`array`

_暂无示例 —— 请查看 `examples/` 和 `showcases/` 了解使用模式。_

## 内部实现

关于 `array_unique` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_unique.md)。
