---
title: "usort()"
description: "为带有静态用户比较器的索引整数数组下放 `usort()`。"
sidebar:
  order: 61
---

## usort()

```php
function usort(array $array, callable $callback): bool
```

为带有静态用户比较器的索引整数数组下放 `usort()`。

**参数**：
- `$array` (`array`)，引用传递
- `$callback` (`callable`)

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_







## 内部实现

关于 `usort` 在编译器中的具体实现，请参阅[内部实现页面](../../../internals/builtins/array/usort.md)。
