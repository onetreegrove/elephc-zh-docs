---
title: "sleep()"
description: "通过目标平台的 C 库符号降级处理 `sleep(seconds)`。"
sidebar:
  order: 308
---

## sleep()

```php
function sleep(int $seconds): int
```

通过目标平台的 C 库符号降级处理 `sleep(seconds)`。

**参数**：
- `$seconds` (`int`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `sleep` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/sleep.md)。
