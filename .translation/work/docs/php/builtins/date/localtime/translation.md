---
title: "localtime()"
description: "通过共享分解运行时辅助函数降级实现 `localtime([$timestamp[, $associative]])`。"
sidebar:
  order: 91
---

## localtime()

```php
function localtime(int $timestamp, bool $associative): array
```

通过共享分解运行时辅助函数降级实现 `localtime([$timestamp[, $associative]])`。

**参数**：
- `$timestamp` (`int`)，可选
- `$associative` (`bool`)，可选

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `localtime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/localtime.md)。
