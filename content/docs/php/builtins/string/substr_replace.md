---
title: "substr_replace()"
description: "降级处理 `substr_replace(string, replacement, start, length?)`。"
sidebar:
  order: 396
---

## substr_replace()

```php
function substr_replace(string $string, string $replace, int $offset, int $length): string
```

降级处理 `substr_replace(string, replacement, start, length?)`。

**参数**：
- `$string` (`string`)
- `$replace` (`string`)
- `$offset` (`int`)
- `$length` (`int`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `substr_replace` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/substr_replace.md)。
