---
title: "hash_hmac()"
description: "通过共享 HMAC 运行时分发器降级处理 `hash_hmac(algo, data, key, binary?)`。"
sidebar:
  order: 352
---

## hash_hmac()

```php
function hash_hmac(string $algo, string $data, string $key, bool $binary): string
```

通过共享 HMAC 运行时分发器降级处理 `hash_hmac(algo, data, key, binary?)`。

**参数**：
- `$algo` (`string`)
- `$data` (`string`)
- `$key` (`string`)
- `$binary` (`bool`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `hash_hmac` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/hash_hmac.md)。
