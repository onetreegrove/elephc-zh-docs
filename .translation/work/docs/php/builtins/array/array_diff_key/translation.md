---
title: "array_diff_key()"
description: "通过过滤第一个操作数的键，为两个关联数组降级处理 `array_diff_key()`。"
sidebar:
  order: 8
---

## array_diff_key()

```php
function array_diff_key(array $array, ...$arrays): array
```

通过过滤第一个操作数的键，为两个关联数组降级处理 `array_diff_key()`。

**参数**：
- `$array` (`array`)
- `...$arrays` — 可变参数：将多余的参数收集到 `$arrays` 中。

**返回值**：`array`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解用法。_



## 内部实现

关于 `array_diff_key` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_diff_key.md)。
