---
title: "array_diff()"
description: "为两个兼容的索引数组（指针大小的载荷槽）降级实现 `array_diff()`。"
sidebar:
  order: 6
---

## array_diff()

```php
function array_diff(array $array, ...$arrays): array
```

为两个兼容的索引数组（指针大小的载荷槽）降级实现 `array_diff()`。

**参数**：
- `$array` (`array`)
- `...$arrays` — 可变参数：将多余的参数收集至 `$arrays`。

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录获取使用模式。_




## 内部实现

关于 `array_diff` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_diff.md)。

