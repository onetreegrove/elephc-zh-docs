---
title: "header()"
description: "将 `header($line[, $replace[, $code]])` 降级为 `__rt_header`，具体化"
sidebar:
  order: 275
---

## header()

```php
function header(mixed $header, mixed $replace, mixed $response_code): void
```

将 `header($line[, $replace[, $code]])` 降级为 `__rt_header`，具体化

**参数**：
- `$header` (`mixed`)
- `$replace` (`mixed`)，可选
- `$response_code` (`mixed`)，可选

**返回值**：`void`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_







## 内部实现

关于 `header` 在编译器中是如何实现的，请参见[内部实现页面](../../../internals/builtins/misc/header.md)。
