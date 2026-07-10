---
title: "trim()"
description: "针对默认和显式掩码降级处理 `trim()`/`ltrim()`/`rtrim()`/`chop()`。"
sidebar:
  order: 397
---

## trim()

```php
function trim(string $string, string $characters): string
```

针对默认和显式掩码降级处理 `trim()`/`ltrim()`/`rtrim()`/`chop()`。

**参数**：
- `$string` (`string`)
- `$characters` (`string`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `trim` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/trim.md)。
