---
title: "fread()"
description: "通过共享运行时文件读取辅助函数降低 `fread(stream, length)` 的实现。"
sidebar:
  order: 167
---

## fread()

```php
function fread(resource $stream, int $length): string
```

通过共享运行时文件读取辅助函数降低 `fread(stream, length)` 的实现。

**参数**：
- `$stream` (`resource`)
- `$length` (`int`)

**返回值**：`string`

_暂无示例 — 请查阅 `examples/` 和 `showcases/` 目录了解用法示例。_




## 内部实现

有关 `fread` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fread.md)。

