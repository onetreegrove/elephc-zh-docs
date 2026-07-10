---
title: "is_readable()"
description: "通过目标感知的运行时 access 辅助函数降级实现 `is_readable(path)`。"
sidebar:
  order: 124
---

## is_readable()

```php
function is_readable(string $filename): bool
```

通过目标感知的运行时 access 辅助函数降级实现 `is_readable(path)`。

**参数**：
- `$filename` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `is_readable` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/is_readable.md)。
