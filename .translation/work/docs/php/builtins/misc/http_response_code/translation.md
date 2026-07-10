---
title: "http_response_code()"
description: "将 `http_response_code([$code])` 降级为 `__rt_http_response_code`。代码（或"
sidebar:
  order: 276
---

## http_response_code()

```php
function http_response_code(mixed $response_code): int
```

将 `http_response_code([$code])` 降级为 `__rt_http_response_code`。代码（或

**参数**：
- `$response_code` (`mixed`)，可选

**返回值**：`int`

_尚无示例 —— 请查阅 `examples/` 和 `showcases/` 了解使用模式。_







## 内部实现

关于编译器中如何实现 `http_response_code`，请参阅[内部实现页面](../../../internals/builtins/misc/http_response_code.md)。
