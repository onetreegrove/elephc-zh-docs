---
title: "sprintf()"
description: "通过为 `__rt_sprintf` 打包可变参数记录降级处理 `sprintf(format, values...)`。"
sidebar:
  order: 375
---

## sprintf()

```php
function sprintf(string $format, ...$values): string
```

通过为 `__rt_sprintf` 打包可变参数记录降级处理 `sprintf(format, values...)`。

**参数**：
- `$format` (`string`)
- `...$values` — 可变参数：将多余参数收集到 `$values` 中。

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `sprintf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/sprintf.md)。
