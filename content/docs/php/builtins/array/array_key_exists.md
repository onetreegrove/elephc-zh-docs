---
title: "array_key_exists()"
description: "为索引数组和关联数组降级实现 `array_key_exists()`。"
sidebar:
  order: 18
---

## array_key_exists()

```php
function array_key_exists(string $key, array $array): bool
```

为索引数组和关联数组降级实现 `array_key_exists()`。

**参数**：
- `$key` (`string`)
- `$array` (`array`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

关于 `array_key_exists` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_key_exists.md)。

