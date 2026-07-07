---
title: "flock()"
description: "通过 libc flock 包装器降级实现 `flock(stream, operation, would_block?)`。"
sidebar:
  order: 162
---

## flock()

```php
function flock(resource $stream, int $operation, bool $would_block): bool
```

通过 libc flock 包装器降级实现 `flock(stream, operation, would_block?)`。

**参数**：
- `$stream` (`resource`)
- `$operation` (`int`)
- `$would_block` (`bool`), passed by reference，可选

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `flock` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/flock.md)。
