---
title: "shuffle()"
description: "通过原地修改源数组，为具有 8 字节槽位的索引数组降级处理 `shuffle()`。"
sidebar:
  order: 57
---

## shuffle()

```php
function shuffle(array $array): bool
```

通过原地修改源数组，为具有 8 字节槽位的索引数组降级处理 `shuffle()`。

**参数**：
- `$array` (`array`)，引用传递

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_






## 内部实现

关于 `shuffle` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/shuffle.md)。
