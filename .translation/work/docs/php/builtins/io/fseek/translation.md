---
title: "fseek()"
description: "降低 `fseek(stream, offset, whence?)` 的调用，并在成功时清除 EOF 状态。"
sidebar:
  order: 169
---

## fseek()

```php
function fseek(resource $stream, int $offset, int $whence): int
```

降低 `fseek(stream, offset, whence?)` 的调用，并在成功时清除 EOF 状态。

**参数**：
- `$stream` (`resource`)
- `$offset` (`int`)
- `$whence` (`int`)，可选

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录以获取使用模式。_




## 内部实现

有关 `fseek` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fseek.md)。

