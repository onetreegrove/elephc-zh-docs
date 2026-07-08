---
title: "crc32()"
description: "通过共享校验和运行时辅助函数降级处理 `crc32(string)`。"
sidebar:
  order: 340
---

## crc32()

```php
function crc32(string $string): int
```

通过共享校验和运行时辅助函数降级处理 `crc32(string)`。

**参数**：
- `$string` (`string`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `crc32` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/crc32.md)。
