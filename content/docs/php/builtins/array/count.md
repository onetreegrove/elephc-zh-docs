---
title: "count()"
description: "通过读取运行时长度头部，为具体的数组值降低 `count(array)`。"
sidebar:
  order: 49
---

## count()

```php
function count(array $value, int $mode): int
```

通过读取运行时长度头部，为具体的数组值降低 `count(array)`。

**参数**：
- `$value` (`array`)
- `$mode` (`int`)，可选

**返回值**：`int`

_暂无示例 — 请检查 `examples/` 和 `showcases/` 以了解使用模式。_

## 内部实现

有关 `count` 在编译器中是如何实现的，请参阅[内部实现页面](../../../internals/builtins/array/count.md)。
