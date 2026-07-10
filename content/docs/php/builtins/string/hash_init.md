---
title: "hash_init()"
description: "降级处理 `hash_init(algo)`，并返回装箱的 HashContext resource。"
sidebar:
  order: 353
---

## hash_init()

```php
function hash_init(string $algo, int $flags = 0, string $key = '', array $options = []): mixed
```

降级处理 `hash_init(algo)`，并返回装箱的 HashContext resource。

**参数**：
- `$algo` (`string`)
- `$flags` (`int`)，默认值为 `0`，可选
- `$key` (`string`)，默认值为 `''`，可选
- `$options` (`array`)，默认值为 `[]`，可选

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `hash_init` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/hash_init.md)。
