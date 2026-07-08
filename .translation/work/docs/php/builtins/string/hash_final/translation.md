---
title: "hash_final()"
description: "通过增量 hash finalizer 降级处理 `hash_final(context, binary?)`。"
sidebar:
  order: 351
---

## hash_final()

```php
function hash_final(resource $context, bool $binary): string
```

通过增量 hash finalizer 降级处理 `hash_final(context, binary?)`。

**参数**：
- `$context` (`resource`)
- `$binary` (`bool`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `hash_final` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/hash_final.md)。
