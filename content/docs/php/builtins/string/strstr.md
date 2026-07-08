---
title: "strstr()"
description: "通过搜索并返回匹配后缀降级处理 `strstr(haystack, needle)`。"
sidebar:
  order: 392
---

## strstr()

```php
function strstr(string $haystack, string $needle, bool $before_needle): string
```

通过搜索并返回匹配后缀降级处理 `strstr(haystack, needle)`。

**参数**：
- `$haystack` (`string`)
- `$needle` (`string`)
- `$before_needle` (`bool`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `strstr` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/strstr.md)。
