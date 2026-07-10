---
title: "json_decode()"
description: "通过共享的 JSON 解码器运行时降级 `json_decode(json, associative?, depth?, flags?)`。"
sidebar:
  order: 228
---

## json_decode()

```php
function json_decode(string $json, bool $associative, int $depth, int $flags): mixed
```

通过共享的 JSON 解码器运行时降级 `json_decode(json, associative?, depth?, flags?)`。

**参数**：
- `$json` (`string`)
- `$associative` (`bool`)，可选
- `$depth` (`int`)，可选
- `$flags` (`int`)，可选

**返回值**：`mixed`

_暂无示例 —— 请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_






## 内部实现

有关 `json_decode` 在编译器中是如何实现的，请参阅[内部实现页面](../../../internals/builtins/json/json_decode.md)。


