---
title: "preg_replace_callback()"
description: "通过受支持的直接回调降级处理 `preg_replace_callback(pattern, callback, subject)`。"
sidebar:
  order: 314
---

## preg_replace_callback()

```php
function preg_replace_callback(string $pattern, callable $callback, string $subject, int $limit = -1, int $count = null, int $flags = 0): array
```

通过受支持的直接回调降级处理 `preg_replace_callback(pattern, callback, subject)`。

**参数**：
- `$pattern` (`string`)
- `$callback` (`callable`)
- `$subject` (`string`)
- `$limit` (`int`)，默认值为 `-1`，可选
- `$count` (`int`)，通过引用传递，默认值为 `null`，可选
- `$flags` (`int`)，默认值为 `0`，可选

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `preg_replace_callback` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/regex/preg_replace_callback.md)。
