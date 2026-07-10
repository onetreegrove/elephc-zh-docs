---
title: "pclose()"
description: "降级处理 `pclose(handle)`，并返回子进程状态。"
sidebar:
  order: 304
---

## pclose()

```php
function pclose(resource $handle): int
```

降级处理 `pclose(handle)`，并返回子进程状态。

**参数**：
- `$handle` (`resource`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `pclose` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/pclose.md)。
