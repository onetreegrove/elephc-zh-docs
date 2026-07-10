---
title: "fstat()"
description: "将 `fstat(stream)` 降级处理，并对运行时 stat 数组或 PHP false 结果进行装箱。"
sidebar:
  order: 170
---

## fstat()

```php
function fstat(resource $stream): mixed
```

将 `fstat(stream)` 降级处理，并对运行时 stat 数组或 PHP false 结果进行装箱。

**参数**：
- `$stream` (`resource`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

有关 `fstat` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fstat.md)。

