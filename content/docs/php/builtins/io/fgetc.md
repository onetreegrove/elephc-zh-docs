---
title: "fgetc()"
description: "降级实现 `fgetc(stream)`，并将单字节字符串或 PHP false 结果装箱。"
sidebar:
  order: 156
---

## fgetc()

```php
function fgetc(resource $stream): mixed
```

降级实现 `fgetc(stream)`，并将单字节字符串或 PHP false 结果装箱。

**参数**：
- `$stream` (`resource`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fgetc` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fgetc.md)。
