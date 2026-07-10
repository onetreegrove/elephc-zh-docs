---
title: "system()"
description: "通过 libc `system()` 降级处理 `system(command)`，并返回旧式空字符串结果。"
sidebar:
  order: 309
---

## system()

```php
function system(string $command, int $result_code): string
```

通过 libc `system()` 降级处理 `system(command)`，并返回旧式空字符串结果。

**参数**：
- `$command` (`string`)
- `$result_code` (`int`)，通过引用传递

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `system` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/system.md)。
