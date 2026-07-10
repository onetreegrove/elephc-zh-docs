---
title: "vsprintf()"
description: "通过 array-to-sprintf 运行时桥接降级处理 `vsprintf(format, values)`。"
sidebar:
  order: 403
---

## vsprintf()

```php
function vsprintf(string $format, array $values): string
```

通过 array-to-sprintf 运行时桥接降级处理 `vsprintf(format, values)`。

**参数**：
- `$format` (`string`)
- `$values` (`array`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `vsprintf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/vsprintf.md)。
