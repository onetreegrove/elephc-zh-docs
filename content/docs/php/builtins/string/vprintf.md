---
title: "vprintf()"
description: "将 `vprintf(format, values)` 降级为 `vsprintf()` 后再输出到 stdout。"
sidebar:
  order: 402
---

## vprintf()

```php
function vprintf(string $format, array $values): int
```

将 `vprintf(format, values)` 降级为 `vsprintf()` 后再输出到 stdout。

**参数**：
- `$format` (`string`)
- `$values` (`array`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `vprintf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/vprintf.md)。
