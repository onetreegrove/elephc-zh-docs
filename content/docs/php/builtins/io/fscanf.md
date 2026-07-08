---
title: "fscanf()"
description: "通过 `__rt_fgets` 和 `__rt_sscanf` 降级实现 `fscanf(stream, format)`。"
sidebar:
  order: 168
---

## fscanf()

```php
function fscanf(resource $stream, string $format, ...$vars): array
```

通过 `__rt_fgets` 和 `__rt_sscanf` 降级实现 `fscanf(stream, format)`。

**参数**：
- `$stream` (`resource`)
- `$format` (`string`)
- `...$vars` — 可变参数：将多余的参数收集到 `$vars` 中。

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

有关 `fscanf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fscanf.md)。

