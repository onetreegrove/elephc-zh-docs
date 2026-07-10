---
title: "vfprintf()"
description: "通过 `__rt_vsprintf` 后接 fwrite 降级处理 `vfprintf(stream, format, values)`。"
sidebar:
  order: 227
---

## vfprintf()

```php
function vfprintf(resource $stream, string $format, array $values): int
```

通过 `__rt_vsprintf` 后接 fwrite 降级处理 `vfprintf(stream, format, values)`。

**参数**：
- `$stream` (`resource`)
- `$format` (`string`)
- `$values` (`array`)

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `vfprintf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/vfprintf.md)。
