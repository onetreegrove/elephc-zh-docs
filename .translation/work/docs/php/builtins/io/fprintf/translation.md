---
title: "fprintf()"
description: "将 `fprintf(stream, format, values...)` 降级为 `sprintf()` 加流写入。"
sidebar:
  order: 165
---

## fprintf()

```php
function fprintf(resource $stream, string $format, ...$values): int
```

将 `fprintf(stream, format, values...)` 降级为 `sprintf()` 加流写入。

**参数**：
- `$stream` (`resource`)
- `$format` (`string`)
- `...$values` — 可变参数：将多余的参数收集到 `$values` 中。

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录获取使用模式。_




## 内部实现

关于 `fprintf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fprintf.md)。

