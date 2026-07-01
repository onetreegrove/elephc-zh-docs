---
title: "array_merge()"
description: "为两个兼容的索引数组（8 字节的载荷槽）降级实现 `array_merge()`。"
sidebar:
  order: 23
---

## array_merge()

```php
function array_merge(...$arrays): array
```

为两个兼容的索引数组（8 字节的载荷槽）降级实现 `array_merge()`。

**参数**：
- `...$arrays` — 可变参数：将多余的参数收集至 `$arrays`。

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_






## 内部实现

关于 `array_merge` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_merge.md)。
