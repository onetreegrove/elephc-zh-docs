---
title: "ftruncate()"
description: "通过共享 fd truncate 运行时辅助函数降级处理 `ftruncate(stream, size)`。"
sidebar:
  order: 173
---

## ftruncate()

```php
function ftruncate(resource $stream, int $size): bool
```

通过共享 fd truncate 运行时辅助函数降级处理 `ftruncate(stream, size)`。

**参数**：
- `$stream` (`resource`)
- `$size` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_




## 内部实现

有关 `ftruncate` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/ftruncate.md)。

