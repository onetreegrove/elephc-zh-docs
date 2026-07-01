---
title: "array_combine()"
description: "通过遗留哈希构建运行时辅助函数降低 `array_combine()` 的实现。"
sidebar:
  order: 5
---

## array_combine()

```php
function array_combine(array $keys, array $values): array
```

通过遗留哈希构建运行时辅助函数降低 `array_combine()` 的实现。

**参数**：
- `$keys`（`array`）
- `$values`（`array`）

**返回值**：`array`

_暂无示例 —— 请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_

## 内部实现

关于 `array_combine` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_combine.md)。
