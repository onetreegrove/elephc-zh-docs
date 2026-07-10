---
title: "json_encode()"
description: "通过共享的 JSON 编码器运行时下放 json_encode(value, flags?, depth?)。"
sidebar:
  order: 229
---

## json_encode()

```php
function json_encode(mixed $value, int $flags, int $depth): string
```

通过共享的 JSON 编码器运行时下放 json_encode(value, flags?, depth?)。

**参数**:
- $value (mixed)
- $flags (int)，可选
- $depth (int)，可选

**返回值**: string

_暂无示例 — 请查看 examples/ 和 showcases/ 以获取使用模式。_







## 内部实现

有关 json_encode 在编译器中是如何实现的，请参见[内部实现页面](../../../internals/builtins/json/json_encode.md)。
