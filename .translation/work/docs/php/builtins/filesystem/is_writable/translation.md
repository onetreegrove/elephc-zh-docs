---
title: "is_writable()"
description: "通过目标感知的运行时 access 辅助函数降级实现 `is_writable(path)`。"
sidebar:
  order: 125
---

## is_writable()

```php
function is_writable(string $filename): bool
```

通过目标感知的运行时 access 辅助函数降级实现 `is_writable(path)`。

**参数**：
- `$filename` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `is_writable` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/is_writable.md)。
