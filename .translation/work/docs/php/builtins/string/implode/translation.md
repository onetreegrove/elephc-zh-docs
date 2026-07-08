---
title: "implode()"
description: "通过选择 string 或 integer 数组辅助函数降级处理 `implode(glue, array)`。"
sidebar:
  order: 359
---

## implode()

```php
function implode(string $separator, array $array): string
```

通过选择 string 或 integer 数组辅助函数降级处理 `implode(glue, array)`。

**参数**：
- `$separator` (`string`)
- `$array` (`array`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `implode` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/implode.md)。
