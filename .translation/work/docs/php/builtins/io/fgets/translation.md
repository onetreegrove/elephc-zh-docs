---
title: "fgets()"
description: "通过共享行读取运行时辅助函数降级实现 `fgets(stream)`。"
sidebar:
  order: 158
---

## fgets()

```php
function fgets(resource $stream, int $length): mixed
```

通过共享行读取运行时辅助函数降级实现 `fgets(stream)`。

**参数**：
- `$stream` (`resource`)
- `$length` (`int`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fgets` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fgets.md)。
