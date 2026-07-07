---
title: "fflush()"
description: "通过共享 fd flush 运行时辅助函数降级实现 `fflush(stream)`。"
sidebar:
  order: 155
---

## fflush()

```php
function fflush(resource $stream): bool
```

通过共享 fd flush 运行时辅助函数降级实现 `fflush(stream)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fflush` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fflush.md)。
