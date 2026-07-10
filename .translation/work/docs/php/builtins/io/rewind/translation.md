---
title: "rewind()"
description: "将 `rewind(stream)` 降级为 `lseek(fd, 0, SEEK_SET)`，并在成功时清除 EOF 状态。"
sidebar:
  order: 185
---

## rewind()

```php
function rewind(resource $stream): bool
```

将 `rewind(stream)` 降级为 `lseek(fd, 0, SEEK_SET)`，并在成功时清除 EOF 状态。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 获取使用模式。_




## 内部实现

关于 `rewind` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/rewind.md)。

