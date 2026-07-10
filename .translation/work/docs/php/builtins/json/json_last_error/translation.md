---
title: "json_last_error()"
description: "通过读取共享的运行时错误码符号来降级 `json_last_error()`。"
sidebar:
  order: 230
---

## json_last_error()

```php
function json_last_error(): int
```

通过读取共享的运行时错误码符号来降级 `json_last_error()`。

**参数**：无。

**返回值**：`int`

_暂无示例 —— 请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

有关 `json_last_error` 在编译器中是如何实现的，请参阅[内部实现页面](../../../internals/builtins/json/json_last_error.md)。
