---
title: "fgetcsv()"
description: "通过 CSV 行运行时辅助函数降级实现 `fgetcsv(stream, separator?, enclosure?)`。"
sidebar:
  order: 157
---

## fgetcsv()

```php
function fgetcsv(resource $stream, int $length, string $separator, string $enclosure, string $escape): array
```

通过 CSV 行运行时辅助函数降级实现 `fgetcsv(stream, separator?, enclosure?)`。

**参数**：
- `$stream` (`resource`)
- `$length` (`int`)，可选
- `$separator` (`string`)，可选
- `$enclosure` (`string`)
- `$escape` (`string`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fgetcsv` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fgetcsv.md)。
