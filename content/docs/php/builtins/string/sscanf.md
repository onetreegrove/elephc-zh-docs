---
title: "sscanf()"
description: "将 `sscanf(string, format)` 降级为共享 scanner 辅助函数。"
sidebar:
  order: 376
---

## sscanf()

```php
function sscanf(string $string, string $format, ...$vars): array
```

将 `sscanf(string, format)` 降级为共享 scanner 辅助函数。

**参数**：
- `$string` (`string`)
- `$format` (`string`)
- `...$vars` — 可变参数：将多余参数收集到 `$vars` 中。

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `sscanf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/sscanf.md)。
