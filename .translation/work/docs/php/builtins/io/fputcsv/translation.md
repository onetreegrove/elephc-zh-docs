---
title: "fputcsv()"
description: "将字符串数组的 `fputcsv(stream, fields, separator?, enclosure?)` 降级处理。"
sidebar:
  order: 166
---

## fputcsv()

```php
function fputcsv(resource $stream, array $fields, string $separator = ',', string $enclosure = '"', string $escape = '\\', string $eol = '\n'): int
```

将字符串数组的 `fputcsv(stream, fields, separator?, enclosure?)` 降级处理。

**参数**：
- `$stream` (`resource`)
- `$fields` (`array`)
- `$separator` (`string`)，默认 `','`，可选
- `$enclosure` (`string`)，默认 `'"'`，可选
- `$escape` (`string`)，默认 `'\\'`，可选
- `$eol` (`string`)，默认 `'\n'`，可选

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的用法。_

## 内部实现

关于 `fputcsv` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fputcsv.md)。
