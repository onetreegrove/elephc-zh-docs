---
title: "preg_replace()"
description: "通过 regex 替换辅助函数降级处理 `preg_replace(pattern, replacement, subject)`。"
sidebar:
  order: 313
---

## preg_replace()

```php
function preg_replace(string $pattern, string $replacement, string $subject, int $limit = -1, int $count = null): string
```

通过 regex 替换辅助函数降级处理 `preg_replace(pattern, replacement, subject)`。

**参数**：
- `$pattern` (`string`)
- `$replacement` (`string`)
- `$subject` (`string`)
- `$limit` (`int`)，默认值为 `-1`，可选
- `$count` (`int`)，通过引用传递，默认值为 `null`，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `preg_replace` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/regex/preg_replace.md)。
