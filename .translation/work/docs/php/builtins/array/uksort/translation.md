---
title: "uksort()"
description: "通过针对静态比较器的遗留用户排序助手，降级处理 `uksort()`。"
sidebar:
  order: 60
---

## uksort()

```php
function uksort(array $array, callable $callback): bool
```

通过针对静态比较器的遗留用户排序助手，降级处理 `uksort()`。

**参数**：
- `$array` (`array`)，引用传递
- `$callback` (`callable`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `uksort` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/uksort.md)。
