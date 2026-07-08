---
title: "str_starts_with()"
description: "降级处理一个双参数 string 内置函数，它会直接委托给运行时辅助函数。"
sidebar:
  order: 384
---

## str_starts_with()

```php
function str_starts_with(string $haystack, string $needle): bool
```

降级处理一个双参数 string 内置函数，它会直接委托给运行时辅助函数。

**参数**：
- `$haystack` (`string`)
- `$needle` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `str_starts_with` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/str_starts_with.md)。
