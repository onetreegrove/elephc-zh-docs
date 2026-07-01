---
title: "array_map()"
description: "通过与回调结果类型匹配的回调运行时辅助函数下放 `array_map()`。"
sidebar:
  order: 22
---

## array_map()

```php
function array_map(callable $callback, array $array, ...$arrays): array
```

通过与回调结果类型匹配的回调运行时辅助函数下放 `array_map()`。

**参数**:
- `$callback` (`callable`)
- `$array` (`array`)
- `...$arrays` — 可变参数：收集多余的参数到 `$arrays` 中。

**返回值**: `array`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_







## 内部实现

关于 `array_map` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_map.md)。
