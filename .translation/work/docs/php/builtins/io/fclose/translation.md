---
title: "fclose()"
description: "在验证并解箱流句柄后降级实现 `fclose(stream)`。"
sidebar:
  order: 152
---

## fclose()

```php
function fclose(resource $stream): bool
```

在验证并解箱流句柄后降级实现 `fclose(stream)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fclose` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fclose.md)。
