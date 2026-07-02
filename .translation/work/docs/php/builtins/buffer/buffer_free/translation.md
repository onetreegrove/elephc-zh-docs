---
title: "buffer_free()"
description: "通过直接 buffer 操作码辅助函数降级 `buffer_free()`。"
sidebar:
  order: 62
---

## buffer_free()

```php
function buffer_free(buffer $buffer): mixed
```

通过直接 buffer 操作码辅助函数降级 `buffer_free()`。

**参数**：
- `$buffer` (`buffer`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `buffer_free` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/buffer/buffer_free.md)。
