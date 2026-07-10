---
title: "gzuncompress()"
description: "降级处理 `gzuncompress(data, max_length?)`，并将 zlib 失败装箱为 PHP false。"
sidebar:
  order: 346
---

## gzuncompress()

```php
function gzuncompress(string $data, int $max_length): string
```

降级处理 `gzuncompress(data, max_length?)`，并将 zlib 失败装箱为 PHP false。

**参数**：
- `$data` (`string`)
- `$max_length` (`int`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `gzuncompress` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/gzuncompress.md)。
