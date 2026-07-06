---
title: "getdate()"
description: "通过共享分解运行时辅助函数降级实现 `getdate([$timestamp])`。"
sidebar:
  order: 87
---

## getdate()

```php
function getdate(int $timestamp): array
```

通过共享分解运行时辅助函数降级实现 `getdate([$timestamp])`。

**参数**：
- `$timestamp` (`int`)，可选

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `getdate` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/date/getdate.md)。
