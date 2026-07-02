---
title: "uasort()"
description: "通过针对静态比较器的遗留用户排序助手，降级处理 `uasort()`。"
sidebar:
  order: 59
---

## uasort()

```php
function uasort(array $array, callable $callback): bool
```

通过针对静态比较器的遗留用户排序助手，降级处理 `uasort()`。

**参数**：
- `$array` (`array`)，引用传递
- `$callback` (`callable`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `uasort` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/uasort.md)。

