---
title: "array_chunk()"
description: "通过将索引数组拆分为嵌套索引数组来降级处理 `array_chunk()`。"
sidebar:
  order: 3
---

## array_chunk()

```php
function array_chunk(array $array, int $length, bool $preserve_keys): array
```

通过将索引数组拆分为嵌套索引数组来降级处理 `array_chunk()`。

**参数**：
- `$array` (`array`)
- `$length` (`int`)
- `$preserve_keys` (`bool`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_




## 内部实现

关于 `array_chunk` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_chunk.md)。

