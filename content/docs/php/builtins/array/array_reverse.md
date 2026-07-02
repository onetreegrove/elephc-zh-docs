---
title: "array_reverse()"
description: "针对具有 8 字节有效负载槽的索引数组降低 `array_reverse()`。"
sidebar:
  order: 34
---

## array_reverse()

```php
function array_reverse(array $array, bool $preserve_keys): array
```

针对具有 8 字节有效负载槽的索引数组降低 `array_reverse()`。

**参数**：
- `$array` (`array`)
- `$preserve_keys` (`bool`)

**返回值**：`array`

_暂无示例 —— 请查阅 `examples/` 和 `showcases/` 目录以了解用法。_







## 内部实现

有关 `array_reverse` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_reverse.md)。
