---
title: "passthru()"
description: "通过 libc `system()` 降级处理 `passthru(command)`，直接透传 stdout。"
sidebar:
  order: 303
---

## passthru()

```php
function passthru(string $command, int $result_code): void
```

通过 libc `system()` 降级处理 `passthru(command)`，直接透传 stdout。

**参数**：
- `$command` (`string`)
- `$result_code` (`int`)，通过引用传递

**返回值**：`void`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `passthru` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/passthru.md)。
