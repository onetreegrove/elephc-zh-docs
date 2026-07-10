---
title: "time()"
description: "通过共享挂钟时间运行时辅助函数降级实现 `time()`。"
sidebar:
  order: 95
---

## time()

```php
function time(): int
```

通过共享挂钟时间运行时辅助函数降级实现 `time()`。

**参数**：无。

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `time` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/time.md)。
