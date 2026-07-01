---
title: "array_is_list()"
description: "将 `array_is_list()` 降级为 `__rt_array_is_list` 运行时谓词，返回 bool 值。"
sidebar:
  order: 17
---

## array_is_list()

```php
function array_is_list(mixed $array): bool
```

将 `array_is_list()` 降级为 `__rt_array_is_list` 运行时谓词，返回 bool 值。

**参数**：
- `$array` (`mixed`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的用法示例。_




## 内部实现

关于 `array_is_list` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_is_list.md)。

