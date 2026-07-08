---
title: "gzdeflate()"
description: "通过内联 raw-DEFLATE zlib 调用降级处理 `gzdeflate(data, level?)`。"
sidebar:
  order: 344
---

## gzdeflate()

```php
function gzdeflate(string $data, int $level, int $encoding): string
```

通过内联 raw-DEFLATE zlib 调用降级处理 `gzdeflate(data, level?)`。

**参数**：
- `$data` (`string`)
- `$level` (`int`)，可选
- `$encoding` (`int`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `gzdeflate` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/gzdeflate.md)。
