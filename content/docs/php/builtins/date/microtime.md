---
title: "microtime()"
description: "降级实现 `microtime()` / `microtime(true)` / `microtime(false)` / `microtime($flag)`。"
sidebar:
  order: 92
---

## microtime()

```php
function microtime(bool $as_float): int
```

降级实现 `microtime()` / `microtime(true)` / `microtime(false)` / `microtime($flag)`。

**参数**：
- `$as_float` (`bool`)，可选

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `microtime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/microtime.md)。
