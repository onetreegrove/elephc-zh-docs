---
title: "str_contains()"
description: "通过 `strpos()` 降级处理 `str_contains()`，并将找到的位置转换为 bool。"
sidebar:
  order: 377
---

## str_contains()

```php
function str_contains(string $haystack, string $needle): bool
```

通过 `strpos()` 降级处理 `str_contains()`，并将找到的位置转换为 bool。

**参数**：
- `$haystack` (`string`)
- `$needle` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `str_contains` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/str_contains.md)。
