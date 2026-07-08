---
title: "preg_split()"
description: "通过 regex 拆分辅助函数降级处理 `preg_split(pattern, subject, limit?, flags?)`。"
sidebar:
  order: 315
---

## preg_split()

```php
function preg_split(string $pattern, string $subject, int $limit, int $flags): array
```

通过 regex 拆分辅助函数降级处理 `preg_split(pattern, subject, limit?, flags?)`。

**参数**：
- `$pattern` (`string`)
- `$subject` (`string`)
- `$limit` (`int`)，可选
- `$flags` (`int`)，可选

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `preg_split` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/regex/preg_split.md)。
