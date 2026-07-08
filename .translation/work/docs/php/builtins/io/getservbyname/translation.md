---
title: "getservbyname()"
description: "将 `getservbyname(service, protocol)` 降级处理，并将缺失条目封装为 PHP `false`。"
sidebar:
  order: 180
---

## getservbyname()

```php
function getservbyname(string $service, string $protocol): mixed
```

将 `getservbyname(service, protocol)` 降级处理，并将缺失条目封装为 PHP `false`。

**参数**：
- `$service` (`string`)
- `$protocol` (`string`)

**返回值**：`mixed`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_

## 内部实现

如需了解 `getservbyname` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/getservbyname.md)。
