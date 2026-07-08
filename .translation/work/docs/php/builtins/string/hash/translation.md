---
title: "hash()"
description: "通过共享运行时 digest 分发器降级处理 `hash(algo, data, binary?)`。"
sidebar:
  order: 347
---

## hash()

```php
function hash(string $algo, string $data, bool $binary = false, array $options = []): string
```

通过共享运行时 digest 分发器降级处理 `hash(algo, data, binary?)`。

**参数**：
- `$algo` (`string`)
- `$data` (`string`)
- `$binary` (`bool`)，默认值为 `false`，可选
- `$options` (`array`)，默认值为 `[]`，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `hash` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/hash.md)。
