---
title: "gethostname()"
description: "通过共享运行时辅助函数降级处理 `gethostname()`。"
sidebar:
  order: 177
---

## gethostname()

```php
function gethostname(): string
```

通过共享运行时辅助函数降级处理 `gethostname()`。

**参数**：无。

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_



## 内部实现

有关 `gethostname` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/gethostname.md)。

