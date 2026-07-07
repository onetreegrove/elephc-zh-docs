---
title: "tmpfile()"
description: "降级实现 `tmpfile()`，并将匿名流描述符或 PHP false 装箱。"
sidebar:
  order: 147
---

## tmpfile()

```php
function tmpfile(): mixed
```

降级实现 `tmpfile()`，并将匿名流描述符或 PHP false 装箱。

**参数**：无。

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `tmpfile` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/tmpfile.md)。
