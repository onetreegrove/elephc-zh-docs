---
title: "hash_update()"
description: "通过增量 hash 运行时辅助函数降级处理 `hash_update(context, data)`。"
sidebar:
  order: 354
---

## hash_update()

```php
function hash_update(resource $context, string $data): bool
```

通过增量 hash 运行时辅助函数降级处理 `hash_update(context, data)`。

**参数**：
- `$context` (`resource`)
- `$data` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `hash_update` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/hash_update.md)。
