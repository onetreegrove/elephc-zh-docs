---
title: "feof()"
description: "通过运行时 EOF 标志表辅助函数降级实现 `feof(stream)`。"
sidebar:
  order: 154
---

## feof()

```php
function feof(resource $stream): bool
```

通过运行时 EOF 标志表辅助函数降级实现 `feof(stream)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `feof` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/feof.md)。
