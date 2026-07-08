---
title: "strpos()"
description: "降级处理 `strpos()`/`strrpos()`，并将 position-or-false 结果装箱为 Mixed。"
sidebar:
  order: 389
---

## strpos()

```php
function strpos(string $haystack, string $needle, int $offset): mixed
```

降级处理 `strpos()`/`strrpos()`，并将 position-or-false 结果装箱为 Mixed。

**参数**：
- `$haystack` (`string`)
- `$needle` (`string`)
- `$offset` (`int`)，可选

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `strpos` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/strpos.md)。
