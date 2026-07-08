---
title: "inet_ntop()"
description: "降级处理 `inet_ntop()` 和 `inet_pton()`，并将无效地址结果装箱为 PHP false。"
sidebar:
  order: 360
---

## inet_ntop()

```php
function inet_ntop(string $ip): mixed
```

降级处理 `inet_ntop()` 和 `inet_pton()`，并将无效地址结果装箱为 PHP false。

**参数**：
- `$ip` (`string`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `inet_ntop` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/inet_ntop.md)。
