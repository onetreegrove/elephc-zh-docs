---
title: "explode()"
description: "将 `explode(delimiter, string)` 降级为共享的字符串数组拆分辅助函数。"
sidebar:
  order: 341
---

## explode()

```php
function explode(string $separator, string $string, int $limit): array
```

将 `explode(delimiter, string)` 降级为共享的字符串数组拆分辅助函数。

**参数**：
- `$separator` (`string`)
- `$string` (`string`)
- `$limit` (`int`)，可选

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `explode` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/explode.md)。
