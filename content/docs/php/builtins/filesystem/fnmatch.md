---
title: "fnmatch()"
description: "通过目标感知的运行时辅助函数降级实现 `fnmatch(pattern, filename, flags?)`。"
sidebar:
  order: 116
---

## fnmatch()

```php
function fnmatch(string $pattern, string $filename, int $flags): bool
```

通过目标感知的运行时辅助函数降级实现 `fnmatch(pattern, filename, flags?)`。

**参数**：
- `$pattern` (`string`)
- `$filename` (`string`)
- `$flags` (`int`)，可选

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fnmatch` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/fnmatch.md)。
