---
title: "umask()"
description: "通过目标感知的运行时辅助函数降级实现 `umask(mask?)`。"
sidebar:
  order: 149
---

## umask()

```php
function umask(int $mask): int
```

通过目标感知的运行时辅助函数降级实现 `umask(mask?)`。

**参数**：
- `$mask` (`int`)，可选

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `umask` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/umask.md)。
