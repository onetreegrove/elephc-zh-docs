---
title: "usleep()"
description: "通过目标平台的 C 库符号降级处理 `usleep(microseconds)`。"
sidebar:
  order: 310
---

## usleep()

```php
function usleep(int $microseconds): void
```

通过目标平台的 C 库符号降级处理 `usleep(microseconds)`。

**参数**：
- `$microseconds` (`int`)

**返回值**：`void`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `usleep` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/usleep.md)。
