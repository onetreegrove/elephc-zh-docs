---
title: "ftell()"
description: "将 `ftell(stream)` 降级为 `lseek(fd, 0, SEEK_CUR)`。"
sidebar:
  order: 172
---

## ftell()

```php
function ftell(resource $stream): int
```

将 `ftell(stream)` 降级为 `lseek(fd, 0, SEEK_CUR)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

关于 `ftell` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/ftell.md)。

