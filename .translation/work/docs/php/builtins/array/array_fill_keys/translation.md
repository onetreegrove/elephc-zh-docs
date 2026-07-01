---
title: "array_fill_keys()"
description: "通过旧版哈希构建运行时辅助函数降级处理 `array_fill_keys()`。"
sidebar:
  order: 10
---

## array_fill_keys()

```php
function array_fill_keys(array $keys, mixed $value): array
```

通过旧版哈希构建运行时辅助函数降级处理 `array_fill_keys()`。

**参数**：
- `$keys` (`array`)
- `$value` (`mixed`)

**返回值**：`array`

_暂无示例 — 请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_




## 内部实现

有关 `array_fill_keys` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_fill_keys.md)。
