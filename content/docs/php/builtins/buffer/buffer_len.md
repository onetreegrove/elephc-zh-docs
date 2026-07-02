---
title: "buffer_len()"
description: "通过直接 buffer 操作码辅助函数降级 `buffer_len()`。"
sidebar:
  order: 63
---

## buffer_len()

```php
function buffer_len(buffer $buffer): int
```

通过直接 buffer 操作码辅助函数降级 `buffer_len()`。

**参数**：
- `$buffer` (`buffer`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `buffer_len` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/buffer/buffer_len.md)。
