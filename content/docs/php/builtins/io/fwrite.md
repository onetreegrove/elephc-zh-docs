---
title: "fwrite()"
description: "将 `fwrite(stream, data)` 降级处理，并返回已写入的字节数。"
sidebar:
  order: 174
---

## fwrite()

```php
function fwrite(resource $stream, string $data, int $length): int
```

将 `fwrite(stream, data)` 降级处理，并返回已写入的字节数。

**参数**：
- `$stream` (`resource`)
- `$data` (`string`)
- `$length` (`int`)

**返回值**：`int`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录中的用法参考。_

## 内部实现

有关 `fwrite` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fwrite.md)。
